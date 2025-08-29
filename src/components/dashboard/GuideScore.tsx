import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Award,
  TrendingUp,
  Users,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/contexts/ApiContext";
import { Guide as ApiGuide } from "@/contexts/ApiContext";

interface Guide {
  id: string;
  name: string;
  number: string;
  vehicle_type: string;
  score: number;
  total_bookings: number;
  rating: number;
  status: "active" | "inactive";
}

const GuideScore = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingGuide, setIsAddingGuide] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [newGuide, setNewGuide] = useState<Partial<Guide>>({
    name: "",
    number: "",
    vehicle_type: "",
    score: 0,
    total_bookings: 0,
    rating: 0,
    status: "active",
  });
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { getGuides, createGuide, updateGuide, deleteGuide } = useApi();

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await getGuides();

      // Check if response has guides array or if it's the array itself
      const guidesData = Array.isArray(response)
        ? response
        : (response as { guides?: ApiGuide[] })?.guides || [];

      // Transform API data to match our interface
      const transformedGuides: Guide[] = guidesData.map((guide: ApiGuide) => ({
        id: guide.id.toString(),
        name: guide.name,
        number: guide.number,
        vehicle_type: guide.vehicle_type,
        score: guide.score,
        total_bookings: guide.total_bookings,
        rating:
          typeof guide.rating === "string"
            ? parseFloat(guide.rating)
            : guide.rating,
        status: guide.status as "active" | "inactive",
      }));

      setGuides(transformedGuides);
    } catch (error) {
      console.error("Error fetching guides:", error);
      toast({
        title: "Error",
        description: "Failed to fetch guides data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = useMemo(() => {
    return guides.filter(
      (guide) =>
        guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.number.includes(searchTerm) ||
        guide.vehicle_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [guides, searchTerm]);

  const topPerformers = useMemo(() => {
    return [...guides].sort((a, b) => b.score - a.score).slice(0, 3);
  }, [guides]);

  const handleAddGuide = async () => {
    if (!newGuide.name || !newGuide.number || !newGuide.vehicle_type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await createGuide({
        name: newGuide.name || "",
        number: newGuide.number || "",
        vehicle_type: newGuide.vehicle_type || "",
        score: newGuide.score || 0,
        total_bookings: newGuide.total_bookings || 0,
        rating: newGuide.rating || 0,
        status: newGuide.status || "active",
      });

      if (success) {
        setNewGuide({
          name: "",
          number: "",
          vehicle_type: "",
          score: 0,
          total_bookings: 0,
          rating: 0,
          status: "active",
        });
        setIsAddingGuide(false);
        await fetchGuides(); // Refresh the list

        toast({
          title: "Guide Added",
          description: "New guide has been successfully added",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add guide",
        variant: "destructive",
      });
    }
  };

  const handleEditGuide = (guide: Guide) => {
    setEditingGuide(guide);
    setNewGuide(guide);
  };

  const handleUpdateGuide = async () => {
    if (!editingGuide) return;

    try {
      const success = await updateGuide(parseInt(editingGuide.id), {
        name: newGuide.name || "",
        number: newGuide.number || "",
        vehicle_type: newGuide.vehicle_type || "",
        score: newGuide.score || 0,
        total_bookings: newGuide.total_bookings || 0,
        rating: newGuide.rating || 0,
        status: newGuide.status || "active",
      });

      if (success) {
        setEditingGuide(null);
        setNewGuide({
          name: "",
          number: "",
          vehicle_type: "",
          score: 0,
          total_bookings: 0,
          rating: 0,
          status: "active",
        });
        await fetchGuides(); // Refresh the list

        toast({
          title: "Guide Updated",
          description: "Guide information has been successfully updated",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update guide",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGuide = async (id: string) => {
    try {
      const success = await deleteGuide(parseInt(id));
      if (success) {
        await fetchGuides(); // Refresh the list
        toast({
          title: "Guide Removed",
          description: "Guide has been successfully removed",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete guide",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 600) return "text-green-400";
    if (score >= 400) return "text-yellow-400";
    return "text-red-400";
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading guides data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold neon-text-primary">
            Guide Performance
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage guide scores
          </p>
        </div>

        <Dialog open={isAddingGuide} onOpenChange={setIsAddingGuide}>
          <DialogTrigger asChild>
            <Button variant="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Guide
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader>
              <DialogTitle className="neon-text-primary">
                Add New Guide
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Guide Name *</Label>
                <Input
                  id="name"
                  value={newGuide.name}
                  onChange={(e) =>
                    setNewGuide({ ...newGuide, name: e.target.value })
                  }
                  placeholder="Enter guide name"
                  className="glass-input"
                />
              </div>

              <div>
                <Label htmlFor="number">Mobile Number *</Label>
                <Input
                  id="number"
                  value={newGuide.number}
                  onChange={(e) =>
                    setNewGuide({ ...newGuide, number: e.target.value })
                  }
                  placeholder="Enter mobile number"
                  className="glass-input"
                />
              </div>

              <div>
                <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                <Select
                  value={newGuide.vehicle_type}
                  onValueChange={(value) =>
                    setNewGuide({ ...newGuide, vehicle_type: value })
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="score">Initial Score</Label>
                  <Input
                    id="score"
                    type="number"
                    value={newGuide.score}
                    onChange={(e) =>
                      setNewGuide({
                        ...newGuide,
                        score: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="glass-input"
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    max="5"
                    value={newGuide.rating}
                    onChange={(e) =>
                      setNewGuide({
                        ...newGuide,
                        rating: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.0"
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={newGuide.status}
                  onValueChange={(value) =>
                    setNewGuide({
                      ...newGuide,
                      status: value as "active" | "inactive",
                    })
                  }
                >
                  <SelectTrigger className="glass-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-border">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAddGuide}
                variant="gradient-primary"
                className="w-full"
              >
                Add Guide
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topPerformers.map((guide, index) => (
          <Card key={guide.id} className="glass-card hover-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {guide.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {guide.vehicle_type}
                    </p>
                  </div>
                </div>
                <Award className="w-6 h-6 text-yellow-400" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score</span>
                  <span className={`font-bold ${getScoreColor(guide.score)}`}>
                    {guide.score}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bookings</span>
                  <span className="font-medium">{guide.total_bookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">⭐ {guide.rating}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search guides by name, number, or vehicle type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Guides Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 neon-text-accent">
            <Users className="w-5 h-5" />
            All Guides ({filteredGuides.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-4 font-semibold text-foreground">
                    Guide Name
                  </th>
                  <th className="p-4 font-semibold text-foreground">
                    Mobile Number
                  </th>
                  <th className="p-4 font-semibold text-foreground">
                    Vehicle Type
                  </th>
                  <th className="p-4 font-semibold text-foreground">Score</th>
                  <th className="p-4 font-semibold text-foreground">
                    Bookings
                  </th>
                  <th className="p-4 font-semibold text-foreground">Rating</th>
                  <th className="p-4 font-semibold text-foreground">Status</th>
                  <th className="p-4 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuides.map((guide, index) => (
                  <tr
                    key={guide.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="p-4 font-medium">{guide.name}</td>
                    <td className="p-4 font-mono text-muted-foreground">
                      {guide.number}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize">
                        {guide.vehicle_type}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold text-lg ${getScoreColor(
                          guide.score
                        )}`}
                      >
                        {guide.score}
                      </span>
                    </td>
                    <td className="p-4 text-center">{guide.total_bookings}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span className="font-medium">{guide.rating}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(guide.status)}>
                        {guide.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGuide(guide)}
                              className="hover:bg-primary/10 hover:text-primary"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="glass-card border-border">
                            <DialogHeader>
                              <DialogTitle className="neon-text-primary">
                                Edit Guide
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="editName">Guide Name</Label>
                                <Input
                                  id="editName"
                                  value={newGuide.name}
                                  onChange={(e) =>
                                    setNewGuide({
                                      ...newGuide,
                                      name: e.target.value,
                                    })
                                  }
                                  className="glass-input"
                                />
                              </div>

                              <div>
                                <Label htmlFor="editNumber">
                                  Mobile Number
                                </Label>
                                <Input
                                  id="editNumber"
                                  value={newGuide.number}
                                  onChange={(e) =>
                                    setNewGuide({
                                      ...newGuide,
                                      number: e.target.value,
                                    })
                                  }
                                  className="glass-input"
                                />
                              </div>

                              <div>
                                <Label htmlFor="editVehicleType">
                                  Vehicle Type
                                </Label>
                                <Select
                                  value={newGuide.vehicle_type}
                                  onValueChange={(value) =>
                                    setNewGuide({
                                      ...newGuide,
                                      vehicle_type: value,
                                    })
                                  }
                                >
                                  <SelectTrigger className="glass-input">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="glass-card border-border">
                                    <SelectItem value="guide">Guide</SelectItem>
                                    <SelectItem value="big car">
                                      Big Car
                                    </SelectItem>
                                    <SelectItem value="tt">TT</SelectItem>
                                    <SelectItem value="car">Car</SelectItem>
                                    <SelectItem value="auto">Auto</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label htmlFor="editScore">Score</Label>
                                  <Input
                                    id="editScore"
                                    type="number"
                                    value={newGuide.score}
                                    onChange={(e) =>
                                      setNewGuide({
                                        ...newGuide,
                                        score: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="glass-input"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="editBookings">Bookings</Label>
                                  <Input
                                    id="editBookings"
                                    type="number"
                                    value={newGuide.total_bookings}
                                    onChange={(e) =>
                                      setNewGuide({
                                        ...newGuide,
                                        total_bookings:
                                          parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="glass-input"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="editRating">Rating</Label>
                                  <Input
                                    id="editRating"
                                    type="number"
                                    step="0.1"
                                    max="5"
                                    value={newGuide.rating}
                                    onChange={(e) =>
                                      setNewGuide({
                                        ...newGuide,
                                        rating: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="glass-input"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label>Status</Label>
                                <Select
                                  value={newGuide.status}
                                  onValueChange={(value) =>
                                    setNewGuide({
                                      ...newGuide,
                                      status: value as "active" | "inactive",
                                    })
                                  }
                                >
                                  <SelectTrigger className="glass-input">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="glass-card border-border">
                                    <SelectItem value="active">
                                      Active
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                      Inactive
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <Button
                                onClick={handleUpdateGuide}
                                variant="gradient-primary"
                                className="w-full"
                              >
                                Update Guide
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGuide(guide.id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                {guides.length === 0
                  ? "No guides found. Add your first guide to get started."
                  : "No guides found matching your search"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuideScore;
