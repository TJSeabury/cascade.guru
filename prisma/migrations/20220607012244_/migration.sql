-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "forename" TEXT,
    "surname" TEXT,
    "userRole" TEXT NOT NULL DEFAULT 'user',
    "numberOfProperties" INTEGER NOT NULL DEFAULT 0,
    "maxProperties" INTEGER NOT NULL DEFAULT 1,
    "planType" TEXT NOT NULL DEFAULT 'single',
    "billable" BOOLEAN NOT NULL DEFAULT true,
    "discountPercent" REAL NOT NULL DEFAULT 0.0
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bio" TEXT,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Property" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "domain" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    CONSTRAINT "Property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_domain_key" ON "Property"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Property_apiKey_key" ON "Property"("apiKey");
