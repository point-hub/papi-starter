import { fileSearch } from '@point-hub/express-utils';

export class TestUtil {
  static async getSchema() {
    const listSchema = [];

    const object = await fileSearch('schema.ts', './src/modules', { maxDeep: 2, regExp: true });
    for (const property in object) {
      const path = `../modules/${object[property].path.replace('\\', '/')}`;
      const { schema } = await import(path);
      listSchema.push(schema);
    }

    return listSchema;
  }
}
