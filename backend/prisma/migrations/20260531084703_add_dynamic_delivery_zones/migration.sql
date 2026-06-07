-- AlterTable
ALTER TABLE "CheckoutSession" ADD COLUMN     "deliveryZoneId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryCitySnapshot" TEXT,
ADD COLUMN     "deliveryTierSnapshot" TEXT,
ADD COLUMN     "deliveryZoneId" TEXT;

-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "deliveryFeeHub" INTEGER NOT NULL DEFAULT 150,
ADD COLUMN     "deliveryFeeOtherCity" INTEGER NOT NULL DEFAULT 200,
ADD COLUMN     "freeDeliveryThreshold" INTEGER NOT NULL DEFAULT 2000,
ALTER COLUMN "deliveryFeeInside" SET DEFAULT 100,
ALTER COLUMN "deliveryFeeOutside" SET DEFAULT 200;

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "areaType" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryZone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryZone_areaType_idx" ON "DeliveryZone"("areaType");

-- CreateIndex
CREATE INDEX "DeliveryZone_tier_idx" ON "DeliveryZone"("tier");

-- CreateIndex
CREATE INDEX "DeliveryZone_isActive_idx" ON "DeliveryZone"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryZone_areaType_city_key" ON "DeliveryZone"("areaType", "city");

-- CreateIndex
CREATE INDEX "CheckoutSession_deliveryZoneId_idx" ON "CheckoutSession"("deliveryZoneId");

-- CreateIndex
CREATE INDEX "Order_deliveryZoneId_idx" ON "Order"("deliveryZoneId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_deliveryZoneId_fkey" FOREIGN KEY ("deliveryZoneId") REFERENCES "DeliveryZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
