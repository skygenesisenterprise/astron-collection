-- One membership per account and workspace: onboarding inserts an organization
-- and its owner membership in a single transaction, and this index is the
-- database-level guard against a second owner row from a duplicate submission.
CREATE UNIQUE INDEX "member_organizationId_userId_unique" ON "member" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");
