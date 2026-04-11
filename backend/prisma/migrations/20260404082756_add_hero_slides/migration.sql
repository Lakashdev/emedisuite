-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "tag" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "sub" TEXT NOT NULL,
    "pill" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "ctaHref" TEXT NOT NULL,
    "ctaAltLabel" TEXT NOT NULL,
    "ctaAltHref" TEXT NOT NULL,
    "featName" TEXT NOT NULL,
    "featPrice" INTEGER NOT NULL,
    "featOld" INTEGER NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'bi-stars',
    "stat1Val" TEXT NOT NULL DEFAULT '100%',
    "stat1Label" TEXT NOT NULL DEFAULT 'Genuine',
    "stat2Val" TEXT NOT NULL DEFAULT 'Same Day',
    "stat2Label" TEXT NOT NULL DEFAULT 'Delivery',
    "micro1" TEXT NOT NULL DEFAULT 'Verified brands',
    "micro2" TEXT NOT NULL DEFAULT 'Delivers in Kathmandu',
    "micro3" TEXT NOT NULL DEFAULT 'Licensed pharmacy',
    "accent" TEXT NOT NULL DEFAULT '#6BBF4E',
    "bg" TEXT NOT NULL DEFAULT 'linear-gradient(135deg, #E8F5E2 0%, #F4F8F0 55%, #EEF2F8 100%)',
    "productId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HeroSlide_position_idx" ON "HeroSlide"("position");

-- CreateIndex
CREATE INDEX "HeroSlide_productId_idx" ON "HeroSlide"("productId");

-- AddForeignKey
ALTER TABLE "HeroSlide" ADD CONSTRAINT "HeroSlide_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
