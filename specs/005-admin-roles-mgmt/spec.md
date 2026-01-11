# Feature Specification: Admin Roles Management

## 1. Overview

**Feature Name:** Admin Roles Management
**Feature Number:** 005
**Short Name:** admin-roles-mgmt
**Status:** Draft

### Description
Implement a Roles management function in the Admin Console. This involves creating backend APIs for Role CRUD operations and updating the frontend navigation to group "Objects" and the new "Roles" management under a common "Setup" submenu. This aligns the admin experience with standard CRM platforms.

### Goals
- Enable administrators to create and manage user roles (MetaRole).
- Organize the Admin Console navigation by grouping administrative tasks (Objects, Roles) under a "Setup" section.

### Out of Scope
- Complex UI for configuring granular permissions (a JSON editor or simple text input will suffice for now).
- Assignment of Roles to Users (this is part of User management, though Roles are a prerequisite).

## 2. User Scenarios

### Scenario 1: Accessing Role Management
1.  Admin logs into the application.
2.  Admin expands the "Setup" menu in the sidebar.
3.  Admin clicks on "Roles".
4.  System displays a list of existing roles (e.g., Admin, Standard User).

### Scenario 2: Creating a New Role
1.  Admin navigates to the "Roles" list page.
2.  Admin clicks "New Role".
3.  System shows a dialog or form.
4.  Admin enters Role Name (e.g., "sales_manager"), Label (e.g., "Sales Manager"), and Description.
5.  Admin saves.
6.  The new role appears in the list.

### Scenario 3: Editing a Role
1.  Admin clicks on an existing role in the list.
2.  System displays role details.
3.  Admin updates the Description or Permissions (via JSON input).
4.  Admin saves changes.
5.  System confirms update.

## 3. Functional Requirements

### 3.1 Backend Capabilities
- **Role Management**:
    - Ability to list all existing roles.
    - Ability to create a new role with a unique name.
    - Ability to retrieve detailed information for a specific role.
    - Ability to update role details (Label, Description, Permissions).
    - Ability to delete a role.
- **Validation Rules**:
    - The role `name` must be unique across the system.
    - System must prevent deletion of system-defined roles (where source is "system").
- **Data Structure**:
    - Support defining role permissions in a structured format (e.g., JSON).

### 3.2 Frontend Experience
- **Navigation (Sidebar)**:
    - Group administrative functions under a common "Setup" section.
    - Provide access to "Objects" and "Roles" within the "Setup" section.
- **Role List Interface**:
    - Display a list of roles showing Label, Name, Description, and Source.
    - Provide a specific action to create a "New Role".
- **Role Editor**:
    - Provide a form to input Role Name (unique identifier), Label (display name), and Description.
    - Provide an input method for defining Permissions (initially as a structured text/code block).

## 4. Non-Functional Requirements
- **Usability**: The "Setup" menu should support hierarchical navigation (e.g., expand/collapse).
- **Consistency**: The Role management interface should follow the same visual patterns as the Object management interface.

## 5. Success Criteria
- **Navigation Structure**: The application sidebar displays a "Setup" group containing both "Objects" and "Roles".
- **Role Administration**: Users with appropriate privileges can successfully Create, Read, Update, and Delete custom Roles.
- **Data Integrity**: The system successfully rejects attempts to create roles with duplicate names.
- **System Protection**: The system successfully rejects attempts to delete pre-defined system roles.

## 6. Assumptions
- The underlying data model for Roles supports storing permissions.
- A text-based configuration for permissions is acceptable for the initial release.
- Role management is restricted to administrative users.