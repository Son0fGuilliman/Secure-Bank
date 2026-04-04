-- CreateEnum
CREATE TYPE "Role" AS ENUM ('nasabah', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('aktif', 'suspend');

-- CreateEnum
CREATE TYPE "TxStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nik" VARCHAR(16) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "nomor_hp" VARCHAR(15),
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'nasabah',
    "status" "UserStatus" NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nomor_rekening" VARCHAR(20) NOT NULL,
    "saldo" DECIMAL(19,2) NOT NULL DEFAULT 0,
    "tipe_akun" VARCHAR(30) NOT NULL DEFAULT 'tabungan',
    "status" VARCHAR(10) NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "dari_rekening" TEXT NOT NULL,
    "ke_rekening" TEXT NOT NULL,
    "nominal" DECIMAL(19,2) NOT NULL,
    "status" "TxStatus" NOT NULL DEFAULT 'PENDING',
    "keterangan" TEXT,
    "blockchain_hash" VARCHAR(66),
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_records" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "tx_hash" VARCHAR(66) NOT NULL,
    "block_number" INTEGER,
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "blockchain_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "aksi" VARCHAR(100) NOT NULL,
    "ip_address" VARCHAR(45),
    "hasil" VARCHAR(10),
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_nomor_rekening_key" ON "accounts"("nomor_rekening");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_records_transaction_id_key" ON "blockchain_records"("transaction_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_dari_rekening_fkey" FOREIGN KEY ("dari_rekening") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_ke_rekening_fkey" FOREIGN KEY ("ke_rekening") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blockchain_records" ADD CONSTRAINT "blockchain_records_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
