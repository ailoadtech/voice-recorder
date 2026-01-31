use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemMemory {
    pub total: u64,      // Total system memory in bytes
    pub available: u64,  // Available memory in bytes
    pub used: u64,       // Used memory in bytes
    pub free: u64,       // Free memory in bytes
}

/// Get system memory information
/// Returns memory statistics in bytes
#[command]
pub async fn get_system_memory() -> Result<SystemMemory, String> {
    #[cfg(target_os = "windows")]
    {
        get_memory_windows()
    }
    
    #[cfg(target_os = "linux")]
    {
        get_memory_linux()
    }
    
    #[cfg(target_os = "macos")]
    {
        get_memory_macos()
    }
}

#[cfg(target_os = "windows")]
fn get_memory_windows() -> Result<SystemMemory, String> {
    use std::mem;
    use std::ptr;
    
    #[repr(C)]
    struct MEMORYSTATUSEX {
        dw_length: u32,
        dw_memory_load: u32,
        ull_total_phys: u64,
        ull_avail_phys: u64,
        ull_total_page_file: u64,
        ull_avail_page_file: u64,
        ull_total_virtual: u64,
        ull_avail_virtual: u64,
        ull_avail_extended_virtual: u64,
    }
    
    extern "system" {
        fn GlobalMemoryStatusEx(lpBuffer: *mut MEMORYSTATUSEX) -> i32;
    }
    
    unsafe {
        let mut mem_status: MEMORYSTATUSEX = mem::zeroed();
        mem_status.dw_length = mem::size_of::<MEMORYSTATUSEX>() as u32;
        
        if GlobalMemoryStatusEx(&mut mem_status) == 0 {
            return Err("Failed to get memory status".to_string());
        }
        
        Ok(SystemMemory {
            total: mem_status.ull_total_phys,
            available: mem_status.ull_avail_phys,
            used: mem_status.ull_total_phys - mem_status.ull_avail_phys,
            free: mem_status.ull_avail_phys,
        })
    }
}

#[cfg(target_os = "linux")]
fn get_memory_linux() -> Result<SystemMemory, String> {
    use std::fs;
    
    let meminfo = fs::read_to_string("/proc/meminfo")
        .map_err(|e| format!("Failed to read /proc/meminfo: {}", e))?;
    
    let mut total = 0u64;
    let mut available = 0u64;
    let mut free = 0u64;
    
    for line in meminfo.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }
        
        let value = parts[1].parse::<u64>().unwrap_or(0) * 1024; // Convert KB to bytes
        
        match parts[0] {
            "MemTotal:" => total = value,
            "MemAvailable:" => available = value,
            "MemFree:" => free = value,
            _ => {}
        }
    }
    
    let used = total.saturating_sub(available);
    
    Ok(SystemMemory {
        total,
        available,
        used,
        free,
    })
}

#[cfg(target_os = "macos")]
fn get_memory_macos() -> Result<SystemMemory, String> {
    use std::mem;
    use std::ptr;
    
    #[repr(C)]
    struct vm_statistics64 {
        free_count: u32,
        active_count: u32,
        inactive_count: u32,
        wire_count: u32,
        zero_fill_count: u64,
        reactivations: u64,
        pageins: u64,
        pageouts: u64,
        faults: u64,
        cow_faults: u64,
        lookups: u64,
        hits: u64,
        purges: u64,
        purgeable_count: u32,
        speculative_count: u32,
        decompressions: u64,
        compressions: u64,
        swapins: u64,
        swapouts: u64,
        compressor_page_count: u32,
        throttled_count: u32,
        external_page_count: u32,
        internal_page_count: u32,
        total_uncompressed_pages_in_compressor: u64,
    }
    
    extern "C" {
        fn host_statistics64(
            host: u32,
            flavor: i32,
            host_info: *mut vm_statistics64,
            host_info_count: *mut u32,
        ) -> i32;
        fn mach_host_self() -> u32;
        fn sysctl(
            name: *const i32,
            namelen: u32,
            oldp: *mut u64,
            oldlenp: *mut usize,
            newp: *const u8,
            newlen: usize,
        ) -> i32;
    }
    
    const HOST_VM_INFO64: i32 = 4;
    const HOST_VM_INFO64_COUNT: u32 = mem::size_of::<vm_statistics64>() as u32 / 4;
    
    unsafe {
        // Get total memory
        let mut total_mem: u64 = 0;
        let mut len = mem::size_of::<u64>();
        let mib = [6, 3]; // CTL_HW, HW_MEMSIZE
        
        if sysctl(
            mib.as_ptr(),
            2,
            &mut total_mem as *mut u64,
            &mut len,
            ptr::null(),
            0,
        ) != 0
        {
            return Err("Failed to get total memory".to_string());
        }
        
        // Get VM statistics
        let mut vm_stats: vm_statistics64 = mem::zeroed();
        let mut count = HOST_VM_INFO64_COUNT;
        
        if host_statistics64(
            mach_host_self(),
            HOST_VM_INFO64,
            &mut vm_stats,
            &mut count,
        ) != 0
        {
            return Err("Failed to get VM statistics".to_string());
        }
        
        let page_size = 4096u64; // Standard page size on macOS
        let free = vm_stats.free_count as u64 * page_size;
        let active = vm_stats.active_count as u64 * page_size;
        let inactive = vm_stats.inactive_count as u64 * page_size;
        let wired = vm_stats.wire_count as u64 * page_size;
        
        let used = active + wired;
        let available = free + inactive;
        
        Ok(SystemMemory {
            total: total_mem,
            available,
            used,
            free,
        })
    }
}
