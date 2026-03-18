-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "adminEmail" TEXT,
ADD COLUMN     "previousCode" TEXT,
ADD COLUMN     "previousCodeExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "League" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GBP',
ADD COLUMN     "entryFee" DOUBLE PRECISION,
ADD COLUMN     "expectedPot" DOUBLE PRECISION,
ADD COLUMN     "format" TEXT NOT NULL DEFAULT 'SINGLES';

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "refereeId" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "emoji" TEXT;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'GBP',
ADD COLUMN     "entryFee" DOUBLE PRECISION,
ADD COLUMN     "expectedPot" DOUBLE PRECISION,
ADD COLUMN     "format" TEXT NOT NULL DEFAULT 'SINGLES';

-- CreateTable
CREATE TABLE "RecoveryToken" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecoveryToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerPayment" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "leagueId" TEXT,
    "tournamentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "amountDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "PlayerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrizePayoutRow" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT,
    "tournamentId" TEXT,
    "position" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,

    CONSTRAINT "PrizePayoutRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecoveryToken_token_key" ON "RecoveryToken"("token");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecoveryToken" ADD CONSTRAINT "RecoveryToken_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPayment" ADD CONSTRAINT "PlayerPayment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPayment" ADD CONSTRAINT "PlayerPayment_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerPayment" ADD CONSTRAINT "PlayerPayment_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizePayoutRow" ADD CONSTRAINT "PrizePayoutRow_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizePayoutRow" ADD CONSTRAINT "PrizePayoutRow_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
