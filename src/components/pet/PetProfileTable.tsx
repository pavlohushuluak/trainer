
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface PetProfile {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  birth_date?: string;
  behavior_focus?: string;
  notes?: string;
  created_at: string;
}

interface PetProfileTableProps {
  pets: PetProfile[];
  onEdit: (pet: PetProfile) => void;
  onDelete: (petId: string, petName: string) => void;
}

const PetProfileTable = ({ pets, onEdit, onDelete }: PetProfileTableProps) => {
  const { t } = useTranslation();
  
  const formatBirthDate = (birthDate: string) => {
    const date = new Date(birthDate);
    return date.toLocaleDateString('de-DE', { 
      year: '2-digit', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('pets.table.name')}</TableHead>
            <TableHead>{t('pets.table.species')}</TableHead>
            <TableHead>{t('pets.table.breed')}</TableHead>
            <TableHead>{t('pets.table.age')}</TableHead>
            <TableHead>{t('pets.table.birthDate')}</TableHead>
            <TableHead>{t('pets.table.focus')}</TableHead>
            <TableHead className="text-right">{t('pets.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pets.map((pet) => (
            <TableRow key={pet.id}>
              <TableCell className="font-medium">
                🐾 {pet.name}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{pet.species}</Badge>
              </TableCell>
              <TableCell>{pet.breed || '-'}</TableCell>
              <TableCell>{pet.age ? `${pet.age} ${t('common.years')}` : '-'}</TableCell>
              <TableCell>
                {pet.birth_date ? formatBirthDate(pet.birth_date) : '-'}
              </TableCell>
              <TableCell>
                {pet.behavior_focus ? (
                  <span className="text-sm text-muted-foreground">
                    {pet.behavior_focus.length > 30 
                      ? `${pet.behavior_focus.substring(0, 30)}...` 
                      : pet.behavior_focus}
                  </span>
                ) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(pet)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('pets.delete.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('pets.delete.confirmation', { name: pet.name })} 
                          <br /><br />
                          {t('pets.delete.warning')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => onDelete(pet.id, pet.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t('pets.delete.confirm')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PetProfileTable;
