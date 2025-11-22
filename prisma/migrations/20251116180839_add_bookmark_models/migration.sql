-- CreateTable
CREATE TABLE "BookmarkList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BookmarkList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookmarkItem" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listId" TEXT NOT NULL,

    CONSTRAINT "BookmarkItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookmarkList_userId_name_key" ON "BookmarkList"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BookmarkItem_listId_ticker_key" ON "BookmarkItem"("listId", "ticker");

-- AddForeignKey
ALTER TABLE "BookmarkList" ADD CONSTRAINT "BookmarkList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookmarkItem" ADD CONSTRAINT "BookmarkItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "BookmarkList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
