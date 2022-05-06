-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "domain" VARCHAR(255) NOT NULL,
    "apiKey" VARCHAR(255) NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_domain_key" ON "Property"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Property_apiKey_key" ON "Property"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "Property_ownerId_key" ON "Property"("ownerId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
