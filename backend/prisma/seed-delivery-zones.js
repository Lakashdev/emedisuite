import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const zones = [
  { city: "Kathmandu", district: "Kathmandu", areaType: "inside_valley", tier: "valley", sortOrder: 1 },
  { city: "Lalitpur", district: "Lalitpur", areaType: "inside_valley", tier: "valley", sortOrder: 2 },
  { city: "Bhaktapur", district: "Bhaktapur", areaType: "inside_valley", tier: "valley", sortOrder: 3 },

  { city: "Pokhara", district: "Kaski", areaType: "outside_valley", tier: "hub", sortOrder: 10 },
  { city: "Bharatpur", district: "Chitwan", areaType: "outside_valley", tier: "hub", sortOrder: 11 },

  { city: "Biratnagar", district: "Morang", areaType: "outside_valley", tier: "other_city", sortOrder: 20 },
  { city: "Butwal", district: "Rupandehi", areaType: "outside_valley", tier: "other_city", sortOrder: 21 },
  { city: "Nepalgunj", district: "Banke", areaType: "outside_valley", tier: "other_city", sortOrder: 22 },
];

async function main() {
  const settings = await prisma.storeSettings.findFirst();

  if (!settings) {
    await prisma.storeSettings.create({
      data: {
        freeDeliveryThreshold: 2000,
        deliveryFeeInside: 100,
        deliveryFeeHub: 150,
        deliveryFeeOtherCity: 200,
        deliveryFeeOutside: 200,
      },
    });
  } else {
    await prisma.storeSettings.update({
      where: { id: settings.id },
      data: {
        freeDeliveryThreshold: 2000,
        deliveryFeeInside: 100,
        deliveryFeeHub: 150,
        deliveryFeeOtherCity: 200,
        deliveryFeeOutside: 200,
      },
    });
  }

  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: {
        areaType_city: {
          areaType: zone.areaType,
          city: zone.city,
        },
      },
      update: zone,
      create: zone,
    });
  }

  console.log("Delivery settings and zones seeded.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
