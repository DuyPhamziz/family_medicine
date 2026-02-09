import { 
  Home, 
  Users, 
  FileText, 
  Search, 
  AlertTriangle, 
  PlusCircle, 
  ClipboardList 
} from 'lucide-react';

export const Icons = {
  Home: Home,
  Patients: Users,
  Form: FileText,
  Search: Search,
  Risk: AlertTriangle, // Dùng cho cảnh báo nguy cơ
  Add: PlusCircle,
  Report: ClipboardList,
};

// Export roles và permissions
export * from './roles';