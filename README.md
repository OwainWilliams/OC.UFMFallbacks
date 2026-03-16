# OC UFM Member Lookup

An Umbraco 17 package that provides seamless member data lookup functionality through UFM (Umbraco Flavored Markdown) tokens. Display member information dynamically in your content using simple, intuitive syntax.

## Features

✅ **UFM Token Support** - Use `{mnl:propertyAlias.fieldName}` syntax to display member data  
✅ **Flexible Member Fields** - Access standard fields (email, username, name) and custom properties  
✅ **Smart Value Parsing** - Handles both UDI (`umb://member/{guid}`) and plain GUID formats  
✅ **Real-time Loading** - Async data fetching with loading states  
✅ **Secure API** - Backoffice authenticated endpoints  
✅ **Zero Configuration** - Automatic registration and setup  

## Quick Start

### Installation
```
Install-Package OC.UFMMemberLookup
```

### Usage
Use UFM tokens in your Umbraco content to display member information:


`author` is the name of the member field in your content, it can be anything you like and name/email/company are the member properties you want to display.
```
{mnl:author.name}
{mnl:author.email}
{mnl:author.company}
```

### Example



## Supported Member Fields

- **Built-in Fields**: `email`, `username`, `name`
- **Custom Properties**: Any custom member property alias

## API Access

The package also provides a REST API for programmatic access:

```
GET /umbraco/management/api/v1/oc/ocmembernamelookup/member-field?memberKey={guid}&field={fieldName}
```

## Requirements

- **Umbraco CMS**: 17.0.0 or later
- **.NET**: 10.0 or later
- **Authentication**: Backoffice access for API endpoints

## Real-World Use Cases

- **Blog Author Information** - Display author bios and contact details
- **Staff Directory** - Show employee contact information  
- **Event Management** - Display organizer and speaker details
- **Member Spotlights** - Feature member profiles and achievements
- **Customer Testimonials** - Show customer names and company details

## What's Included

After installation, the package automatically provides:

- UFM component registration for `mnl` tokens
- Management API controllers
- Client-side assets in `/App_Plugins/OCUFMMemberLookup/`
- Automatic service registration

No additional configuration required!

## Documentation & Support

- 📖 **Full Documentation**: [GitHub Repository](https://github.com/OwainWilliams/OC.UFMMemberLookup)
- 🐛 **Issues & Support**: [GitHub Issues](https://github.com/OwainWilliams/OC.UFMMemberLookup/issues)
- 💡 **Feature Requests**: Submit via GitHub Issues

## Package Information

- **Package ID**: `OC.UFMMemberLookup`
- **Current Version**: `1.0.0-alpha`
- **License**: MIT
- **Maintainer**: Owain Williams

---

**Made with ❤️ for the Umbraco Community**

