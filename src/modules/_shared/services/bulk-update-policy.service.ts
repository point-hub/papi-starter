export interface IBulkUpdatePolicyService {
  unique(data: object, uniqueConstraints: string[]): { [key: string]: string[] } | null;
}

export const bulkUpdatePolicyService: IBulkUpdatePolicyService = {
  unique(data, uniqueConstraints): { [key: string]: string[] } | null {
    /**
     * Collect all unique fields (flatten compound indexes)
     */
    const uniqueFields = new Set(uniqueConstraints.flat());

    /**
     * Find which unique fields are being updated
     */
    const touched = Object.keys(data).filter(
      key => uniqueFields.has(key),
    );

    /**
     * No restricted fields touched → safe to proceed
     */
    if (touched.length === 0) {
      return null;
    }

    /**
     * Build validation error payload
     */
    return Object.fromEntries(
      touched.map(field => [field, [`This ${field} field cannot be updated in bulk operations.`]]),
    );
  },
};