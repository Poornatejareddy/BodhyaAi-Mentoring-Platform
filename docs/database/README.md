# Database reference

MongoDB/Mongoose collections: `User`, `Student`, `Mentor`, `Admin`, `Alert`, `AuditLog`, `Message`, `Intervention`, and `SurveyLink`.

Core relationships: User has one role profile; Student references User and optional Mentor; Mentor references User and an array of Students; Intervention references Student and Mentor; Alert references recipient User and optional Student; Message references participants and optional Student; SurveyLink references Mentor and Student. Profile-owned risk/personality outputs are embedded in Student.

Indexes exist for common mentor/student/alert/message/audit/intervention queries; see model files for exact definitions. There is no `institutionId` or tenant key on these collections, so the current schema is single-tenant by design.
