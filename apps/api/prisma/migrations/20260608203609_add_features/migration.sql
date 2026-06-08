-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "acousticness" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "danceability" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "darkness" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "energy" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "era" TEXT,
ADD COLUMN     "experimental" DOUBLE PRECISION NOT NULL DEFAULT 50,
ADD COLUMN     "genres" TEXT[],
ADD COLUMN     "influenceScore" INTEGER NOT NULL DEFAULT 80,
ADD COLUMN     "origin" TEXT;

-- CreateTable
CREATE TABLE "ExplorationHistory" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExplorationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListMember" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,

    CONSTRAINT "ListMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "coverColor" TEXT NOT NULL DEFAULT '#8B1E1E',
    "artistIds" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListMember_listId_artistId_key" ON "ListMember"("listId", "artistId");

-- AddForeignKey
ALTER TABLE "ExplorationHistory" ADD CONSTRAINT "ExplorationHistory_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListMember" ADD CONSTRAINT "ListMember_listId_fkey" FOREIGN KEY ("listId") REFERENCES "UserList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListMember" ADD CONSTRAINT "ListMember_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
