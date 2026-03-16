using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Management.Routing;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Core.Services;

namespace OC.MemberNameLookup.Controllers
{
    [ApiVersion("1.0")]
    [VersionedApiBackOfficeRoute("oc/ocmembernamelookup")]
    [ApiExplorerSettings(GroupName = Constants.ApiName)]

    public class OCUFMMemberLookupApiController : OCUFMMemberLookupApiControllerBase
    {
        private readonly IMemberService _memberService;


        public OCUFMMemberLookupApiController(IBackOfficeSecurityAccessor backOfficeSecurityAccessor, IMemberService memberService) : base(backOfficeSecurityAccessor)
        {
            _memberService = memberService;

        }

        [HttpGet("member-field")]
        [MapToApiVersion("1.0")]
        [ProducesResponseType<string>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult GetMemberField([FromQuery] Guid memberKey, [FromQuery] string field)
        {
            var authResult = ValidateUserAccess(out _);
            if (authResult != null)
                return authResult; // Return the result instead of throwing

            var member = _memberService.GetById(memberKey);
            if (member == null)
                return NotFound();

            var value = field switch
            {
                "email" => member.Email,
                "username" => member.Username,
                "name" => member.Name,
                _ => member.GetValue<string>(field)
            };

            return Ok(value ?? string.Empty);
        }
    }
}
