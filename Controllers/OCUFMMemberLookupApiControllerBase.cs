using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Core.Security;
using Umbraco.Cms.Web.Common.Authorization;

namespace OC.MemberNameLookup.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Authorize(Policy = AuthorizationPolicies.BackOfficeAccess)]
    [MapToApi(Constants.ApiName)]
    public abstract class OCUFMMemberLookupApiControllerBase : ControllerBase
    {
        protected readonly IBackOfficeSecurityAccessor _backOfficeSecurityAccessor;

        public OCUFMMemberLookupApiControllerBase(IBackOfficeSecurityAccessor backOfficeSecurityAccessor)
        {
            _backOfficeSecurityAccessor = backOfficeSecurityAccessor;
        }

        protected IActionResult? ValidateUserAccess(out int userId)
        {
            userId = 0;
            var currentUser = _backOfficeSecurityAccessor.BackOfficeSecurity?.CurrentUser;

            if (currentUser == null)
            {
                return Unauthorized();
            }

            userId = currentUser.Id;
            return null;
        }
    }
}
