import { DrupalJsonApiResponse, DrupalNode } from "@/types/drupal";
import { fetchByPath } from "./customFetch";
import { processNode } from "./generated";

export async function getDrupalData(path: string, includeParams: string) {
	try {
		const result = await fetchByPath<DrupalJsonApiResponse<DrupalNode>>(path, {
			params: {
				include: includeParams, // Pass specific includes for each content type
			},
		});

		if (result?.data?.data) {
			return processNode(result.data.data, result.data.included);
		}
		return null;
	} catch {
		console.error(`Failed to fetch ${path}`);
		return null;
	}
}