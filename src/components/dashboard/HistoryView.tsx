import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Calendar,
  Download,
  Eye,
  SortAsc,
  SortDesc,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/contexts/ApiContext";

interface HistoryRecord {
  id: number;
  invoice_no: string;
  guide_name: string;
  guide_number: string;
  vehicle_type: string;
  createdAt: string;
  show_name: string;
  adults: number;
  final_amount: number;
  status: "completed" | "pending" | "cancelled";
}

interface ApiTicketsResponse {
  tickets: HistoryRecord[];
  total: number;
}

type SortField = keyof HistoryRecord;
type SortDirection = "asc" | "desc";

const HistoryView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getTickets } = useApi();

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await getTickets();

      // Check if response has tickets array or if it's the array itself
      const ticketsData = Array.isArray(response)
        ? response
        : (response as ApiTicketsResponse)?.tickets || [];

      // Transform API data to match HistoryRecord interface
      const transformedData: HistoryRecord[] = ticketsData.map(
        (ticket: any) => ({
          id: ticket.id,
          invoice_no:
            ticket.invoice_no || `TKT${ticket.id.toString().padStart(4, "0")}`,
          guide_name: ticket.guide_name,
          guide_number: ticket.guide_number,
          vehicle_type: ticket.vehicle_type,
          createdAt: ticket.createdAt,
          show_name: ticket.show_name,
          adults: ticket.adults,
          final_amount: ticket.final_amount,
          status: ticket.status || "completed",
        })
      );

      setHistoryData(transformedData);
    } catch (error) {
      console.error("Error fetching history data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch history data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = historyData.filter(
      (record) =>
        record.guide_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.guide_number?.includes(searchTerm) ||
        record.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.show_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.invoice_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt") {
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
  }, [searchTerm, sortField, sortDirection, historyData]);

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
      description: `Opening details for ${record.guide_name}`,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading history data...</span>
      </div>
    );
  }

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
            Recent Transactions ({historyData.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("invoice_no")}
                  >
                    <div className="flex items-center">
                      Invoice No
                      <SortIcon field="invoice_no" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("guide_name")}
                  >
                    <div className="flex items-center">
                      Guide Name
                      <SortIcon field="guide_name" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("guide_number")}
                  >
                    <div className="flex items-center">
                      Guide Number
                      <SortIcon field="guide_number" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("vehicle_type")}
                  >
                    <div className="flex items-center">
                      Vehicle Type
                      <SortIcon field="vehicle_type" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Date
                      <SortIcon field="createdAt" />
                    </div>
                  </th>
                  <th
                    className="p-4 font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                    onClick={() => handleSort("show_name")}
                  >
                    <div className="flex items-center">
                      Show Name
                      <SortIcon field="show_name" />
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
                    onClick={() => handleSort("final_amount")}
                  >
                    <div className="flex items-center">
                      Total Paid
                      <SortIcon field="final_amount" />
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
                      {record.invoice_no}
                    </td>
                    <td className="p-4 font-medium">{record.guide_name}</td>
                    <td className="p-4 font-mono text-muted-foreground">
                      {record.guide_number}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {record.vehicle_type}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(record.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">{record.show_name}</td>
                    <td className="p-4 text-center">{record.adults}</td>
                    <td className="p-4">
                      <span className="font-bold neon-text-accent">
                        ₹{record.final_amount}
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
                {historyData.length === 0
                  ? "No transaction history found"
                  : "No records found matching your search"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryView;
