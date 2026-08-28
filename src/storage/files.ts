import { Directory, File, Paths } from 'expo-file-system';

const managedRoot = new Directory(Paths.document, 'hang-on-images');

function ensureDirectory(collection: 'wardrobe' | 'checks') {
  managedRoot.create({ idempotent: true, intermediates: true });
  const directory = new Directory(managedRoot, collection);
  directory.create({ idempotent: true, intermediates: true });
  return directory;
}
function safeExtension(source: File) {
  return /^\.[a-z0-9]{1,6}$/i.test(source.extension) ? source.extension.toLowerCase() : '.jpg';
}

async function persistImage(sourceUri: string, collection: 'wardrobe' | 'checks', id: string) {
  const directory = ensureDirectory(collection);
  if (sourceUri.startsWith(directory.uri)) return sourceUri;

  const source = new File(sourceUri);
  const safeId = id.replace(/[^a-z0-9-]/gi, '-');
  const destination = new File(directory, `${safeId}${safeExtension(source)}`);
  await source.copy(destination, { overwrite: true });
  return destination.uri;
}

export function persistWardrobeImage(sourceUri: string, id: string) {
  return persistImage(sourceUri, 'wardrobe', id);
}

export function persistCheckImage(sourceUri: string, id: string) {
  return persistImage(sourceUri, 'checks', id);
}

export function deleteManagedImage(uri?: string) {
  if (!uri || !uri.startsWith(managedRoot.uri)) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}
