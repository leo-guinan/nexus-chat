-- CreateTable
CREATE TABLE "SubmindTask" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submindId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "canCurrentlyComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SubmindTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubmindMetric" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submindTaskId" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "cadence" TEXT NOT NULL,

    CONSTRAINT "SubmindMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledThought" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "baseThought" TEXT NOT NULL,
    "schedule" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledThought_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubmindTask" ADD CONSTRAINT "SubmindTask_submindId_fkey" FOREIGN KEY ("submindId") REFERENCES "Submind"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmindTask" ADD CONSTRAINT "SubmindTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubmindMetric" ADD CONSTRAINT "SubmindMetric_submindTaskId_fkey" FOREIGN KEY ("submindTaskId") REFERENCES "SubmindTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
