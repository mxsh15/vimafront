using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using ShopVima.Application.Dtos.Auth;
using ShopVima.Application.Services;
using ShopVima.Domain.Entities;
using ShopVima.Domain.Enums;
using ShopVima.Infrastructure.Persistence;
using System.Net;
using System.Security.Claims;

namespace ShopVimaAPI.Controllers;


[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ShopDbContext _db;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IPermissionService _permissionService;

    public AuthController(
        ShopDbContext db,
        IJwtService jwtService,
        IPasswordHasher passwordHasher,
        IPermissionService permissionService)
    {
        _db = db;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
        _permissionService = permissionService;
    }

    [HttpPost("register")]
    [EnableRateLimiting("auth_register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();

        if (await _db.Users.AnyAsync(u => u.Email == email && !u.IsDeleted))
            return BadRequest(new { message = "این ایمیل قبلاً ثبت شده است" });

        var user = new User
        {
            Email = email,
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            PhoneNumber = dto.PhoneNumber,
            Role = UserRole.Customer,
            EmailVerified = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);

        var vendorMembers = await _db.VendorMembers
            .Include(vm => vm.Vendor)
            .Where(vm => vm.UserId == user.Id && vm.IsActive)
            .Select(vm => new
            {
                vm.VendorId,
                vm.Vendor.StoreName,
                vm.Role,
                vm.IsActive
            })
            .ToListAsync();

        var firstOwnerVendor = vendorMembers.FirstOrDefault(vm => vm.Role == "Owner");
        var vendorId = firstOwnerVendor != null ? (Guid?)firstOwnerVendor.VendorId : null;

        return Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                VendorId = vendorId,
                VendorIds = vendorMembers.Select(vm => vm.VendorId).ToList(),
                Vendors = vendorMembers.Select(vm => new VendorInfoDto
                {
                    Id = vm.VendorId,
                    StoreName = vm.StoreName,
                    Role = vm.Role,
                    IsActive = vm.IsActive
                }).ToList()
            }
        });
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth_login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);

        if (user == null)
            return Unauthorized(new { message = "ایمیل یا رمز عبور اشتباه است" });

        var verify = _passwordHasher.VerifyPassword(dto.Password, user.PasswordHash);
        if (verify == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "ایمیل یا رمز عبور اشتباه است" });

        if (verify == PasswordVerificationResult.SuccessRehashNeeded)
            user.PasswordHash = _passwordHasher.HashPassword(dto.Password);

        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);

        var vendorMembers = await _db.VendorMembers
            .Include(vm => vm.Vendor)
            .Where(vm => vm.UserId == user.Id && vm.IsActive)
            .Select(vm => new
            {
                vm.VendorId,
                vm.Vendor.StoreName,
                vm.Role,
                vm.IsActive
            })
            .ToListAsync();

        var firstOwnerVendor = vendorMembers.FirstOrDefault(vm => vm.Role == "Owner");
        var vendorId = firstOwnerVendor != null ? (Guid?)firstOwnerVendor.VendorId : null;

        return Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role.ToString(),
                VendorId = vendorId,
                VendorIds = vendorMembers.Select(vm => vm.VendorId).ToList(),
                Vendors = vendorMembers.Select(vm => new VendorInfoDto
                {
                    Id = vm.VendorId,
                    StoreName = vm.StoreName,
                    Role = vm.Role,
                    IsActive = vm.IsActive
                }).ToList()
            }
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
        if (user == null) return NotFound();

        var vendorMembers = await _db.VendorMembers
            .Include(vm => vm.Vendor)
            .Where(vm => vm.UserId == user.Id && vm.IsActive)
            .Select(vm => new
            {
                vm.VendorId,
                vm.Vendor.StoreName,
                vm.Role,
                vm.IsActive
            })
            .ToListAsync();

        var firstOwnerVendor = vendorMembers.FirstOrDefault(vm => vm.Role == "Owner");
        var vendorId = firstOwnerVendor != null ? (Guid?)firstOwnerVendor.VendorId : null;

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role.ToString(),
            VendorId = vendorId,
            VendorIds = vendorMembers.Select(vm => vm.VendorId).ToList(),
            Vendors = vendorMembers.Select(vm => new VendorInfoDto
            {
                Id = vm.VendorId,
                StoreName = vm.StoreName,
                Role = vm.Role,
                IsActive = vm.IsActive
            }).ToList()
        });
    }

    [HttpGet("permissions")]
    [Authorize]
    public async Task<ActionResult<List<string>>> GetMyPermissions()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var permissions = await _permissionService.GetUserPermissionsAsync(userId);
        return Ok(permissions);
    }
}



//[ApiController]
//[Route("api/auth")]
//public class AuthController : ControllerBase
//{
//    private readonly ShopDbContext _db;
//    private readonly IJwtService _jwtService;
//    private readonly IPasswordHasher _passwordHasher;
//    private readonly IPermissionService _permissionService;
//    private readonly ILogger<AuthController> _logger;
//    private readonly IConfiguration _config;
//    private readonly IWebHostEnvironment _env;

//    public AuthController(
//        ShopDbContext db,
//        IJwtService jwtService,
//        IPasswordHasher passwordHasher,
//        IPermissionService permissionService,
//        ILogger<AuthController> logger,
//        IConfiguration config,
//        IWebHostEnvironment env)
//    {
//        _db = db;
//        _jwtService = jwtService;
//        _passwordHasher = passwordHasher;
//        _permissionService = permissionService;
//        _logger = logger;
//        _config = config;
//        _env = env;
//    }

//    [HttpPost("register")]
//    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
//    {
//        // بررسی تکراری نبودن ایمیل
//        if (await _db.Users.AnyAsync(u => u.Email == dto.Email && !u.IsDeleted))
//        {
//            return BadRequest(new { message = "این ایمیل قبلاً ثبت شده است" });
//        }

//        // ایجاد کاربر جدید
//        var user = new User
//        {
//            Email = dto.Email.ToLowerInvariant(),
//            PasswordHash = _passwordHasher.HashPassword(dto.Password),
//            FirstName = dto.FirstName,
//            LastName = dto.LastName,
//            PhoneNumber = dto.PhoneNumber,
//            Role = dto.Role,
//            EmailVerified = false, // در آینده می‌توان ایمیل تایید اضافه کرد
//            CreatedAtUtc = DateTime.UtcNow
//        };

//        _db.Users.Add(user);
//        await _db.SaveChangesAsync();

//        // تولید توکن
//        var token = _jwtService.GenerateToken(user);

//        // دریافت اطلاعات Vendorها از VendorMember
//        var vendorMembers = await _db.VendorMembers
//            .Include(vm => vm.Vendor)
//            .Where(vm => vm.UserId == user.Id && vm.IsActive)
//            .Select(vm => new
//            {
//                vm.VendorId,
//                vm.Vendor.StoreName,
//                vm.Role,
//                vm.IsActive
//            })
//            .ToListAsync();

//        // اولین Vendor با نقش Owner برای سازگاری با کدهای قدیمی
//        var firstOwnerVendor = vendorMembers.FirstOrDefault(vm => vm.Role == "Owner");
//        var vendorId = firstOwnerVendor != null ? (Guid?)firstOwnerVendor.VendorId : null;

//        return Ok(new AuthResponseDto
//        {
//            Token = token,
//            User = new UserDto
//            {
//                Id = user.Id,
//                Email = user.Email,
//                FirstName = user.FirstName,
//                LastName = user.LastName,
//                FullName = user.FullName,
//                PhoneNumber = user.PhoneNumber,
//                Role = user.Role.ToString(),
//                VendorId = vendorId, // برای سازگاری با کدهای قدیمی
//                VendorIds = vendorMembers.Select(vm => vm.VendorId).ToList(),
//                Vendors = vendorMembers.Select(vm => new VendorInfoDto
//                {
//                    Id = vm.VendorId,
//                    StoreName = vm.StoreName,
//                    Role = vm.Role,
//                    IsActive = vm.IsActive
//                }).ToList()
//            }
//        });
//    }

//    [HttpPost("login")]
//    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
//    {
//        var user = await _db.Users
//            .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLowerInvariant() && !u.IsDeleted);

//        if (user == null || !_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash))
//        {
//            return Unauthorized(new { message = "ایمیل یا رمز عبور اشتباه است" });
//        }

//        user.LastLoginAt = DateTime.UtcNow;
//        await _db.SaveChangesAsync();

//        var userId = user.Id;
//        var permissions = await _permissionService.GetUserPermissionsAsync(userId);
//        var token = _jwtService.GenerateToken(user);

//        var vendorMembers = await _db.VendorMembers
//            .Include(vm => vm.Vendor)
//            .Where(vm => vm.UserId == user.Id && vm.IsActive)
//            .Select(vm => new
//            {
//                vm.VendorId,
//                vm.Vendor.StoreName,
//                vm.Role,
//                vm.IsActive
//            })
//            .ToListAsync();


//        var firstOwnerVendor = vendorMembers.FirstOrDefault(vm => vm.Role == "Owner");
//        var vendorId = firstOwnerVendor != null ? (Guid?)firstOwnerVendor.VendorId : null;

//        return Ok(new AuthResponseDto
//        {
//            Token = token,
//            User = new UserDto
//            {
//                Id = user.Id,
//                Email = user.Email,
//                FirstName = user.FirstName,
//                LastName = user.LastName,
//                FullName = user.FullName,
//                PhoneNumber = user.PhoneNumber,
//                Role = user.Role.ToString(),
//                VendorId = vendorId, // برای سازگاری با کدهای قدیمی
//                VendorIds = vendorMembers.Select(vm => vm.VendorId).ToList(),
//                Vendors = vendorMembers.Select(vm => new VendorInfoDto
//                {
//                    Id = vm.VendorId,
//                    StoreName = vm.StoreName,
//                    Role = vm.Role,
//                    IsActive = vm.IsActive
//                }).ToList()
//            }
//        });
//    }

//    [HttpPost("emergency-reset-password")]
//    [AllowAnonymous]
//    public async Task<IActionResult> EmergencyResetPassword([FromBody] EmergencyResetPasswordDto dto)
//    {
//        //var enabled = string.Equals(_config["EmergencyReset:Enabled"], "true", StringComparison.OrdinalIgnoreCase);
//        //if (!enabled)
//        //    return NotFound();

//        //var allowNonDev = string.Equals(_config["EmergencyReset:AllowNonDevelopment"], "true", StringComparison.OrdinalIgnoreCase);
//        //if (!_env.IsDevelopment() && !allowNonDev)
//        //    return NotFound();

//        //var allowNonLocal = string.Equals(_config["EmergencyReset:AllowNonLocal"], "true", StringComparison.OrdinalIgnoreCase);
//        //var remoteIp = HttpContext.Connection.RemoteIpAddress;
//        //var isLocal = remoteIp != null && (IPAddress.IsLoopback(remoteIp) || remoteIp.Equals(IPAddress.IPv6Loopback));
//        //if (!allowNonLocal && !isLocal)
//        //    return NotFound();

//        //var masterKey = _config["EmergencyReset:MasterKey"];
//        //if (string.IsNullOrWhiteSpace(masterKey) || string.IsNullOrWhiteSpace(emergencyKey))
//        //    return Unauthorized(new { message = "کلید اضطراری ارسال نشده است" });

//        //var a = System.Text.Encoding.UTF8.GetBytes(masterKey);
//        //var b = System.Text.Encoding.UTF8.GetBytes(emergencyKey);
//        //if (a.Length != b.Length || !CryptographicOperations.FixedTimeEquals(a, b))
//        //    return Unauthorized(new { message = "کلید اضطراری نامعتبر است" });

//        var email = dto.Email.ToLowerInvariant();
//        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
//        if (user == null)
//            return NotFound(new { message = "کاربر پیدا نشد" });

//        if (user.Role != UserRole.Admin)
//            return Forbid();

//        user.PasswordHash = _passwordHasher.HashPassword(dto.NewPassword);
//        user.UpdatedAtUtc = DateTime.UtcNow;

//        await _db.SaveChangesAsync();

//        return Ok(new { message = "رمز عبور با موفقیت ریست شد" });
//    }


//    [HttpGet("me")]
//    public async Task<ActionResult<UserDto>> GetCurrentUser()
//    {
//        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
//        {
//            return Unauthorized();
//        }

//        var user = await _db.Users
//            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

//        if (user == null)
//        {
//            return NotFound();
//        }

//        // دریافت اطلاعات Vendorها از VendorMember
//        var vendorMembers = await _db.VendorMembers
//            .Include(vm => vm.Vendor)
//            .Where(vm => vm.UserId == user.Id && vm.IsActive)
//            .Select(vm => new
//            {
//                vm.VendorId,
//                vm.Vendor.StoreName,
//                vm.Role,
//                vm.IsActive
//            })
//            .ToListAsync();

//        // اولین Vendor با نقش Owner برای سازگاری با کدهای قدیمی
//        var firstOwnerVendor = vendorMembers.FirstOrDefault(vm => vm.Role == "Owner");
//        var vendorId = firstOwnerVendor != null ? (Guid?)firstOwnerVendor.VendorId : null;

//        return Ok(new UserDto
//        {
//            Id = user.Id,
//            Email = user.Email,
//            FirstName = user.FirstName,
//            LastName = user.LastName,
//            FullName = user.FullName,
//            PhoneNumber = user.PhoneNumber,
//            Role = user.Role.ToString(),
//            VendorId = vendorId, // برای سازگاری با کدهای قدیمی
//            VendorIds = vendorMembers.Select(vm => vm.VendorId).ToList(),
//            Vendors = vendorMembers.Select(vm => new VendorInfoDto
//            {
//                Id = vm.VendorId,
//                StoreName = vm.StoreName,
//                Role = vm.Role,
//                IsActive = vm.IsActive
//            }).ToList()
//        });
//    }

//    [HttpGet("permissions")]
//    [Authorize]
//    public async Task<ActionResult<List<string>>> GetMyPermissions()
//    {
//        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
//        {
//            return Unauthorized();
//        }

//        var permissions = await _permissionService.GetUserPermissionsAsync(userId);

//        return Ok(permissions);
//    }
//}




