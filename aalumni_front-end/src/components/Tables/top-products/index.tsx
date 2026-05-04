import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTopProducts } from "../fetch";

export async function TopProducts() {
  const data = await getTopProducts();

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="px-6 py-4 sm:px-7 sm:py-5 xl:px-8.5">
        <h2 className="text-2xl font-bold text-dark dark:text-white">
          Active Job Postings
        </h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-t text-base [&>th]:h-auto [&>th]:py-3 sm:[&>th]:py-4.5">
            <TableHead className="min-w-[120px] pl-5 sm:pl-6 xl:pl-7.5">
              Job Title
            </TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="pr-5 text-right sm:pr-6 xl:pr-7.5">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((product) => (
            <TableRow
              className="text-base font-medium text-dark dark:text-white"
              key={product.name + product.profit}
            >
              <TableCell className="flex min-w-fit items-center gap-3 pl-5 sm:pl-6 xl:pl-7.5">
                <div>{product.name}</div>
              </TableCell>

              <TableCell>{product.category}</TableCell>

              <TableCell>{product.price}</TableCell>

              <TableCell>{product.sold}</TableCell>

              <TableCell className="pr-5 text-right text-green-light-1 sm:pr-6 xl:pr-7.5">
                {product.profit}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
