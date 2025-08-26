import { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  Download,
  Eye,
  SortAsc,
  SortDesc,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface HistoryRecord {
  id: string;
  invoiceNo: string;
  guideName: string;
  guideNumber: string;
  vehicleType: string;
  date: string;
  showName: string;
  adults: number;
  totalPaid: number;
  status: "completed" | "pending" | "cancelled";
}

// Mock data - in a real app, this would come from an API
const mockHistoryData: HistoryRecord[] = [
  {
    id: "1",
    invoiceNo: "INV001",
    guideName: "Rahman",
    guideNumber: "9019296034",
    vehicleType: "guide",
    date: "2024-01-15",
    showName: "Celebrity Wax Museum",
    adults: 4,
    totalPaid: 646,
    status: "completed",
  },
  {
    id: "2",
    invoiceNo: "INV002",
    guideName: "Loki",
    guideNumber: "9380320892",
    vehicleType: "big car",
    date: "2024-01-14",
    showName: "Horror Show",
    adults: 6,
    totalPaid: 548,
    status: "completed",
  },
  {
    id: "3",
    invoiceNo: "INV003",
    guideName: "Sathish",
    guideNumber: "9141352476",
    vehicleType: "tt",
    date: "2024-01-13",
    showName: "History Museum",
    adults: 3,
    totalPaid: 502,
    status: "pending",
  },
  {
    id: "4",
    invoiceNo: "INV004",
    guideName: "Babu",
    guideNumber: "9901225482",
    vehicleType: "tt",
    date: "2024-01-12",
    showName: "Celebrity Wax Museum",
    adults: 2,
    totalPaid: 436,
    status: "completed",
  },
  {
    id: "5",
    invoiceNo: "INV005",
    guideName: "Rohith",
    guideNumber: "7676911516",
    vehicleType: "big car",
    date: "2024-01-11",
    showName: "Horror Show",
    adults: 5,
    totalPaid: 410,
    status: "cancelled",
  },
];

type SortField = keyof HistoryRecord;
type SortDirection = "asc" | "desc";

const HistoryView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const { toast } = useToast();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = mockHistoryData.filter(
      (record) =>
        record.guideName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.guideNumber.includes(searchTerm) ||
        record.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.showName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "date") {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [searchTerm, sortField, sortDirection]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleViewDetails = (record: HistoryRecord) => {
    toast({
      title: "Viewing Details",
      description: `Opening details for ${record.guideName}`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Exporting Data",
      description: "Preparing history data for download",
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <SortAsc className="w-4 h-4 ml-1" />
    ) : (
      <SortDesc className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text-primary">
            Transaction History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all transactions
          </p>
        </div>

        <Button onClick={handleExport} variant="gradient-secondary">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by guide name, number, vehicle type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input pl-10"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{filteredAndSortedData.length} records found</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="neon-text-accent">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("invoiceNo")}
                  >
                    <div className="flex items-center">
                      Invoice No
                      <SortIcon field="invoiceNo" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("guideName")}
                  >
                    <div className="flex items-center">
                      Guide Name
                      <SortIcon field="guideName" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("guideNumber")}
                  >
                    <div className="flex items-center">
                      Guide Number
                      <SortIcon field="guideNumber" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("vehicleType")}
                  >
                    <div className="flex items-center">
                      Vehicle Type
                      <SortIcon field="vehicleType" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("showName")}
                  >
                    <div className="flex items-center">
                      Show Name
                      <SortIcon field="showName" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("adults")}
                  >
                    <div className="flex items-center">
                      Adults
                      <SortIcon field="adults" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("totalPaid")}
                  >
                    <div className="flex items-center">
                      Total Paid
                      <SortIcon field="totalPaid" />
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-foreground">Status</th>
                  <th className="p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.map((record, index) => (
                  <tr
                    key={record.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="p-4 font-mono text-primary">
                      {record.invoiceNo}
                    </td>
                    <td className="p-4 font-medium">{record.guideName}</td>
                    <td className="p-4 font-mono text-muted-foreground">
                      {record.guideNumber}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {record.vehicleType}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">{record.showName}</td>
                    <td className="p-4 text-center">{record.adults}</td>
                    <td className="p-4">
                      <span className="font-bold neon-text-accent">
                        ₹{record.totalPaid}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(record)}
                        className="hover:bg-primary/10 hover:text-primary"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No records found matching your search
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryView;
