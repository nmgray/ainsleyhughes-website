import { readdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const imageDirectory = join(root, 'static', 'images', 'migrated');
const extensions = { jpeg: '.jpg', png: '.png', webp: '.webp', gif: '.gif' };
const replacements = new Map();
let bytesBefore = 0;
let bytesAfter = 0;

for (const name of await readdir(imageDirectory)) {
	const source = join(imageDirectory, name);
	const sourceStat = await stat(source);
	if (!sourceStat.isFile()) continue;
	const sourceBuffer = await readFile(source);
	const metadata = await sharp(sourceBuffer)
		.metadata()
		.catch(() => null);
	const outputExtension = metadata?.format ? extensions[metadata.format] : undefined;
	if (!metadata || !outputExtension) continue;

	bytesBefore += sourceStat.size;
	const currentExtension = extname(name).toLowerCase();
	const extensionMatches =
		currentExtension === outputExtension ||
		(metadata.format === 'jpeg' && currentExtension === '.jpeg');
	const outputName = extensionMatches
		? name
		: `${name.slice(0, -currentExtension.length)}${outputExtension}`;
	const destination = join(imageDirectory, outputName);
	const temporary = `${destination}.optimizing`;
	const shouldOptimize =
		metadata.format !== 'gif' && (!extensionMatches || (metadata.width ?? 0) > 2200);

	if (shouldOptimize) {
		let pipeline = sharp(sourceBuffer).rotate().resize({
			width: 2200,
			height: 2200,
			fit: 'inside',
			withoutEnlargement: true
		});
		if (metadata.format === 'webp') pipeline = pipeline.webp({ quality: 82, effort: 4 });
		if (metadata.format === 'jpeg') pipeline = pipeline.jpeg({ quality: 82, mozjpeg: true });
		if (metadata.format === 'png') pipeline = pipeline.png({ compressionLevel: 9 });
		await pipeline.toFile(temporary);
		await unlink(source);
		await rename(temporary, destination);
	} else if (source !== destination) {
		await rename(source, destination);
	}

	bytesAfter += (await stat(destination)).size;
	if (name !== outputName) {
		replacements.set(`/images/migrated/${name}`, `/images/migrated/${outputName}`);
	}
}

async function updateReferences(directory) {
	for (const entry of await readdir(directory, { withFileTypes: true })) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			await updateReferences(path);
			continue;
		}
		if (!/\.(json|svelte|ts)$/.test(entry.name)) continue;
		const original = await readFile(path, 'utf8');
		let updated = original;
		for (const [before, after] of replacements) updated = updated.replaceAll(before, after);
		if (updated !== original) await writeFile(path, updated);
	}
}

await updateReferences(join(root, 'src'));

console.log(
	`Normalized ${replacements.size} extensions; reduced ${(bytesBefore / 1024 / 1024).toFixed(1)} MB to ${(bytesAfter / 1024 / 1024).toFixed(1)} MB.`
);
