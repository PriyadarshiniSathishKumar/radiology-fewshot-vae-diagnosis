import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { 
  Database, 
  Calendar, 
  Tag, 
  MoreHorizontal,
  Eye,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getTypeColor = (type) => {
  const colors = {
    chest_xray: "bg-blue-100 text-blue-800",
    ct_scan: "bg-purple-100 text-purple-800",
    mri: "bg-green-100 text-green-800",
    dermoscopy: "bg-orange-100 text-orange-800",
    mammography: "bg-pink-100 text-pink-800",
    retinal: "bg-teal-100 text-teal-800"
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

const getStatusColor = (status) => {
  const colors = {
    uploaded: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default function DatasetCard({ dataset, onView, onDelete }) {
  return (
    <motion.div whileHover={{ y: -5, transition: { duration: 0.2 } }} className="h-full">
      <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm h-full hover:shadow-teal-500/10 transition-shadow duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-slate-100">
                <Database className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 mb-1">
                  {dataset.name}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(dataset.type)}>
                    {dataset.type?.replace('_', ' ')}
                  </Badge>
                  <Badge className={getStatusColor(dataset.status)}>
                    {dataset.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(dataset)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(dataset)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {dataset.description && (
            <p className="text-sm text-slate-600 line-clamp-3">
              {dataset.description}
            </p>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Tag className="w-4 h-4" />
              <span>{dataset.total_samples || 0} samples</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(dataset.created_date), 'MMM d, yyyy')}</span>
            </div>
          </div>

          {dataset.classes && dataset.classes.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Classes:</p>
              <div className="flex flex-wrap gap-1">
                {dataset.classes.slice(0, 3).map((cls, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {cls}
                  </Badge>
                ))}
                {dataset.classes.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{dataset.classes.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}