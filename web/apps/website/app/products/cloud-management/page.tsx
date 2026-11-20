import { FamilyOverview } from "@/components/catalogue/FamilyOverview";
import { familyContent } from "@/lib/content/product-families";
import { FAMILIES, pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";

const family = "cloud-management" as const;
const content = familyContent[family];

export const metadata: Metadata = pageMetadata({
	title: content.metaTitle,
	description: content.metaDescription,
	path: FAMILIES[family].route,
});

export default function CloudManagementPage() {
	return <FamilyOverview family={family} />;
}
