package services

import (
	"context"

	"github.com/skygenesisenterprise/astron-collection/server/src/interfaces"
	"github.com/skygenesisenterprise/astron-collection/server/src/models"
	"github.com/skygenesisenterprise/astron-collection/server/src/utils"
)

func requireWorkspaceMember(
	ctx context.Context,
	repos *Repositories,
	principal interfaces.Principal,
	workspaceID string,
) (*models.WorkspaceMember, error) {
	member, err := repos.WorkspaceMembers().Get(ctx, workspaceID, principal.UserID)
	if err != nil {
		if utils.AsAppError(err).Code != "MEMBERSHIP_REQUIRED" {
			return nil, err
		}
		return nil, utils.ErrMembershipRequired
	}
	return member, nil
}

func requireWorkspaceAdmin(
	ctx context.Context,
	repos *Repositories,
	principal interfaces.Principal,
	workspaceID string,
) (*models.WorkspaceMember, error) {
	member, err := requireWorkspaceMember(ctx, repos, principal, workspaceID)
	if err != nil {
		return nil, err
	}
	if !isAdminRole(member.Role) {
		return nil, utils.ErrForbidden
	}
	return member, nil
}
