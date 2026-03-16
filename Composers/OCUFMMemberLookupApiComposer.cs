using Asp.Versioning;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace OC.MemberNameLookup.Composers
{
    public class OCUFMMemberLookupApiComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {

            builder.Services.AddSingleton<IOperationIdHandler, CustomOperationHandler>();

            builder.Services.Configure<SwaggerGenOptions>(opt =>
            {

                opt.SwaggerDoc(Constants.ApiName, new OpenApiInfo
                {
                    Title = "OC UFM Member Lookup Backoffice API",
                    Version = "1.0",
                });

                // Only include our own controllers in this Swagger document, and exclude them
                // from Umbraco's built-in documents. Without this predicate Swagger tries to
                // include every endpoint in every document, producing duplicate operation IDs
                // and a 500 when the ocmembernamelookup/swagger.json is generated.
                opt.DocInclusionPredicate((docName, apiDesc) =>
                {
                    if (docName == Constants.ApiName)
                        return apiDesc.GroupName == Constants.ApiName;

                    return apiDesc.GroupName != Constants.ApiName;
                });

                // Enable Umbraco authentication for the "Example" Swagger document
                // PR: https://github.com/umbraco/Umbraco-CMS/pull/15699
                opt.OperationFilter<OCUFMMemberLookupOperationSecurityFilter>();
            });
        }

        public class OCUFMMemberLookupOperationSecurityFilter : BackOfficeSecurityRequirementsOperationFilterBase
        {
            protected override string ApiName => Constants.ApiName;
        }

        // This is used to generate nice operation IDs in our swagger json file
        // So that the gnerated TypeScript client has nice method names and not too verbose
        // https://docs.umbraco.com/umbraco-cms/tutorials/creating-a-backoffice-api/umbraco-schema-and-operation-ids#operation-ids
        public class CustomOperationHandler : OperationIdHandler
        {
            public CustomOperationHandler(IOptions<ApiVersioningOptions> apiVersioningOptions) : base(apiVersioningOptions)
            {
            }

            protected override bool CanHandle(ApiDescription apiDescription, ControllerActionDescriptor controllerActionDescriptor)
            {
                return controllerActionDescriptor.ControllerTypeInfo.Namespace?.StartsWith("OC.UFMMemberLookup.Controllers", comparisonType: StringComparison.InvariantCultureIgnoreCase) is true;
            }

            public override string Handle(ApiDescription apiDescription) => $"{apiDescription.ActionDescriptor.RouteValues["action"]}";
        }
    }
}
