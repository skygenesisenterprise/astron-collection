import type { GetServerSideProps } from "next";

/**
 * Root entry point.
 *
 * "/" never renders: it is the stable public entry and always answers with a
 * 307 to the sign-in page. Signed-in visitors are then resolved by `/login`,
 * which redirects to their active organization's workspace.
 */
export default function IndexPage() {
	return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
	redirect: {
		destination: "/login",
		// `permanent: false` answers with 307 so the method and body are
		// preserved and the entry point can be repointed later.
		permanent: false,
	},
});
