import { useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/contexts/ApiContext";

interface TicketData {
  id: string;
  vehicleType: string;
  guideName: string;
  guideNumber: string;
  showName: string;
  adults: number;
  ticketPrice: number;
  totalPrice: number;
  tax: number;
  finalAmount: number;
}

const TicketManager = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Partial<TicketData>>({
    vehicleType: "",
    guideName: "",
    guideNumber: "",
    showName: "",
    adults: 0,
    ticketPrice: 0,
    totalPrice: 0,
    tax: 0,
    finalAmount: 0,
  });

  const { toast } = useToast();
  const { createTicket, loading } = useApi();

  const calculateTotals = (updatedTicket: Partial<TicketData>) => {
    const adults = updatedTicket.adults || 0;
    const ticketPrice = updatedTicket.ticketPrice || 0;
    const totalPrice = adults * ticketPrice;
    const tax = updatedTicket.tax || 0;
    const finalAmount = totalPrice + (totalPrice * tax) / 100;

    return {
      ...updatedTicket,
      totalPrice,
      finalAmount,
    };
  };

  const handleInputChange = (
    field: keyof TicketData,
    value: string | number
  ) => {
    const updatedTicket = {
      ...currentTicket,
      [field]: value,
    };

    if (field === "adults" || field === "ticketPrice" || field === "tax") {
      const calculated = calculateTotals(updatedTicket);
      setCurrentTicket(calculated);
    } else {
      setCurrentTicket(updatedTicket);
    }
  };

  const addTicket = async () => {
    if (
      !currentTicket.vehicleType ||
      !currentTicket.guideName ||
      !currentTicket.showName
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for API
    const ticketData = {
      vehicle_type: currentTicket.vehicleType || "",
      guide_name: currentTicket.guideName || "",
      guide_number: currentTicket.guideNumber || "",
      show_name: currentTicket.showName || "",
      adults: currentTicket.adults || 0,
      ticket_price: currentTicket.ticketPrice || 0,
      total_price: currentTicket.totalPrice || 0,
      tax: currentTicket.tax || 0,
      final_amount: currentTicket.finalAmount || 0,
    };

    // Call API to create ticket
    const success = await createTicket(ticketData);

    if (success) {
      // Add to local state only if API call was successful
      const newTicket: TicketData = {
        id: Date.now().toString(),
        vehicleType: currentTicket.vehicleType || "",
        guideName: currentTicket.guideName || "",
        guideNumber: currentTicket.guideNumber || "",
        showName: currentTicket.showName || "",
        adults: currentTicket.adults || 0,
        ticketPrice: currentTicket.ticketPrice || 0,
        totalPrice: currentTicket.totalPrice || 0,
        tax: currentTicket.tax || 0,
        finalAmount: currentTicket.finalAmount || 0,
      };

      setTickets([...tickets, newTicket]);
      setCurrentTicket({
        vehicleType: "",
        guideName: "",
        guideNumber: "",
        showName: "",
        adults: 0,
        ticketPrice: 0,
        totalPrice: 0,
        tax: 0,
        finalAmount: 0,
      });

      toast({
        title: "Ticket Added",
        description: "New ticket has been successfully added",
      });
    }
  };

  const removeTicket = (id: string) => {
    setTickets(tickets.filter((ticket) => ticket.id !== id));
    toast({
      title: "Ticket Removed",
      description: "Ticket has been deleted successfully",
    });
  };

  const printTickets = () => {
    if (tickets.length === 0) {
      toast({
        title: "No Tickets",
        description: "Please add tickets before printing",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Printing Tickets",
      description: `Preparing ${tickets.length} ticket(s) for printing`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text-primary">
            Ticket Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage museum tickets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Ticket Form */}
        <Card className="glass-card hover-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 neon-text-accent">
              <Plus className="w-5 h-5" />
              New Ticket
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <Select
                  value={currentTicket.vehicleType}
                  onValueChange={(value) =>
                    handleInputChange("vehicleType", value)
                  }
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-border">
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="big car">Big Car</SelectItem>
                    <SelectItem value="tt">TT</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="guideName">Guide Name *</Label>
                <Input
                  id="guideName"
                  value={currentTicket.guideName}
                  onChange={(e) =>
                    handleInputChange("guideName", e.target.value)
                  }
                  placeholder="Enter guide name"
                  className="glass-input"
                />
              </div>

              <div>
                <Label htmlFor="guideNumber">Guide Mobile Number</Label>
                <Input
                  id="guideNumber"
                  value={currentTicket.guideNumber}
                  onChange={(e) =>
                    handleInputChange("guideNumber", e.target.value)
                  }
                  placeholder="Enter mobile number"
                  className="glass-input"
                />
              </div>

              <div>
                <Label htmlFor="showName">Show Name *</Label>
                <Select
                  value={currentTicket.showName}
                  onValueChange={(value) =>
                    handleInputChange("showName", value)
                  }
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select show" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-border">
                    <SelectItem value="Celebrity Wax Museum">
                      Celebrity Wax Museum
                    </SelectItem>
                    <SelectItem value="Horror Show">Horror Show</SelectItem>
                    <SelectItem value="History Museum">
                      History Museum
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  value={currentTicket.adults}
                  onChange={(e) =>
                    handleInputChange("adults", parseInt(e.target.value) || 0)
                  }
                  placeholder="Number of adults"
                  className="glass-input"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="ticketPrice">Ticket Price</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  value={currentTicket.ticketPrice}
                  onChange={(e) =>
                    handleInputChange(
                      "ticketPrice",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Price per ticket"
                  className="glass-input"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="totalPrice">Total Price</Label>
                <Input
                  id="totalPrice"
                  type="number"
                  value={currentTicket.totalPrice}
                  readOnly
                  className="glass-input bg-muted/50"
                />
              </div>

              <div>
                <Label htmlFor="tax">Tax (%)</Label>
                <Input
                  id="tax"
                  type="number"
                  value={currentTicket.tax}
                  onChange={(e) =>
                    handleInputChange("tax", parseFloat(e.target.value) || 0)
                  }
                  placeholder="Tax percentage"
                  className="glass-input"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">
                  Final Total Amount
                </Label>
                <div className="text-2xl font-bold neon-text-primary">
                  ₹{currentTicket.finalAmount?.toFixed(2) || "0.00"}
                </div>
              </div>

              <Button
                onClick={addTicket}
                variant="gradient-primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Adding Ticket..." : "Add Ticket"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Tickets */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 neon-text-accent">
                <Calculator className="w-5 h-5" />
                Current Session ({tickets.length})
              </CardTitle>
              {tickets.length > 0 && (
                <Button onClick={printTickets} variant="gradient-secondary">
                  Print All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tickets added yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="glass-card p-4 border border-border/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold text-primary">
                          {ticket.guideName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {ticket.showName}
                        </p>
                        <p className="text-sm">
                          {ticket.vehicleType} • {ticket.adults} adults
                        </p>
                        <p className="text-lg font-bold neon-text-accent">
                          ₹{ticket.finalAmount.toFixed(2)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTicket(ticket.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketManager;
