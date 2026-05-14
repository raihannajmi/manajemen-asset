/*
  Warnings:

  - A unique constraint covering the columns `[request_id,doc_type]` on the table `rental_request_documents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "rental_request_documents_request_id_doc_type_key" ON "rental_request_documents"("request_id", "doc_type");
