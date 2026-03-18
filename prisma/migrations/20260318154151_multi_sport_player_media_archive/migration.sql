-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "clubName" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "sport" TEXT NOT NULL DEFAULT 'TABLE_TENNIS';

-- AlterTable
ALTER TABLE "League" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nickname" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
