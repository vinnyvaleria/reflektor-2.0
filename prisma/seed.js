// prisma/seed.js
// populate database with initial data - to work with later on

import { PrismaClient } from '@prisma/client';
import { STORY_MAPS } from '../src/lib/server/maps/storyMaps.js';

const prisma = new PrismaClient();

async function main() {
	console.log('Seeding story maps...');

	// insert all story maps into database
	// our goal is to have 30 story mode maps
	for (const storyMap of STORY_MAPS) {
		await prisma.storyMap.upsert({
			where: { level: storyMap.level },
			update: storyMap,
			create: storyMap
		});
	}

	console.log(`Seeded ${STORY_MAPS.length} story maps!`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
