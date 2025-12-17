import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { User } from '@/api/entities';
import { RoleTemplate } from '@/api/entities';
import { UserAppAccess } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AuditLog } from '@/api/entities';

// Mock API functions for RBAC
const setRoleTemplateApi = async (payload) => {
    if (payload.id) {
        return RoleTemplate.update(payload.id, payload);
    }
    return RoleTemplate.create(payload);
};

const setUserAccessApi = async (payload) => {
    const existing = await UserAppAccess.findOne({ client_app_id: payload.client_app_id, user_email: payload.user_email });
    if (existing) {
        return UserAppAccess.update(existing.id, payload);
    }
    return UserAppAccess.create(payload);
};

export default function AdminRolesPage() {
    const [templates, setTemplates] = useState([]);
    const [accessList, setAccessList] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedAccess, setSelectedAccess] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const { toast } = useToast();

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [cUser, rTemplates, uAccess, allUsers] = await Promise.all([
                User.me(),
                RoleTemplate.list(),
                UserAppAccess.list(),
                User.list(),
            ]);
            setCurrentUser(cUser);
            setTemplates(rTemplates);
            setAccessList(uAccess);
            setUsers(allUsers);
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load RBAC data.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSaveTemplate = async (templateData, originalData) => {
        try {
            const res = await setRoleTemplateApi(templateData);
            await AuditLog.create({
                org_id: currentUser.current_org_id,
                user_id: currentUser.email,
                action: templateData.id ? 'update' : 'create',
                table_name: 'RoleTemplate',
                record_id: res.id,
                before: originalData || {},
                after: res,
            });
            toast({ title: 'Success', description: `Role template '${res.name}' saved.` });
            loadData();
            return true;
        } catch (e) {
            toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
            return false;
        }
    };
    
    const handleSaveAccess = async (accessData, originalData) => {
        try {
            const res = await setUserAccessApi(accessData);
            await AuditLog.create({
                org_id: currentUser.current_org_id,
                user_id: currentUser.email,
                action: accessData.id ? 'update' : 'create',
                table_name: 'UserAppAccess',
                record_id: res.id,
                before: originalData || {},
                after: res,
            });
            toast({ title: 'Success', description: `Access for '${res.user_email}' saved.` });
            loadData();
            return true;
        } catch (e) {
            toast({ variant: 'destructive', title: 'Save Failed', description: e.message });
            return false;
        }
    };

    if (isLoading) return <div className="p-6">Loading RBAC Console...</div>;

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold">RBAC Console</h1>
            <div className="grid md:grid-cols-2 gap-8">
                {/* Role Templates Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>Role Templates</CardTitle>
                        <CardDescription>Define reusable sets of permissions for your organization.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {templates.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-2 border rounded-md">
                                    <span>{t.name}</span>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedTemplate(t)}>Edit</Button>
                                </div>
                            ))}
                        </div>
                        <Button className="mt-4 w-full" onClick={() => setSelectedTemplate({})}>Create New Template</Button>
                    </CardContent>
                </Card>

                {/* User Access Panel */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Access Assignments</CardTitle>
                        <CardDescription>Assign roles to users for specific applications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-2">
                            {accessList.map(a => (
                                <div key={a.id} className="flex justify-between items-center p-2 border rounded-md">
                                    <div>
                                        <p className="font-medium">{a.user_email}</p>
                                        <p className="text-sm text-gray-500">{a.role_name} on App {a.client_app_id.substring(0,8)}...</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedAccess(a)}>Edit</Button>
                                </div>
                            ))}
                        </div>
                        <Button className="mt-4 w-full" onClick={() => setSelectedAccess({})}>Assign New Access</Button>
                    </CardContent>
                </Card>
            </div>
            
            {selectedTemplate && <TemplateEditor template={selectedTemplate} onSave={handleSaveTemplate} onClose={() => setSelectedTemplate(null)} />}
            {selectedAccess && <AccessEditor access={selectedAccess} templates={templates} users={users} onSave={handleSaveAccess} onClose={() => setSelectedAccess(null)} />}
        </div>
    );
}

function TemplateEditor({ template, onSave, onClose }) {
    const isNew = !template.id;
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            name: template.name || '',
            description: template.description || '',
            permissions: template.permissions || {
                manage_apps: false,
                manage_rbac: false,
                view_profiles: true,
                manage_engagements: false,
                view_insights: true,
                manage_billing: false,
                manage_compliance: false,
                view_audit_logs: false
            }
        }
    });
    
    const [isOpen, setIsOpen] = useState(true);

    const handleFormSubmit = async (data) => {
        const payload = { ...template, ...data };
        const success = await onSave(payload, template);
        if (success) {
            setIsOpen(false);
            onClose();
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isNew ? 'Create' : 'Edit'} Role Template</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="name">Role Name</Label>
                        <Input id="name" {...register('name', { required: true })} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">Name is required.</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" {...register('description')} />
                    </div>
                    <fieldset>
                        <legend className="font-medium mb-2">Permissions</legend>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(template.permissions || {}).map(perm => (
                                <Controller
                                    key={perm}
                                    name={`permissions.${perm}`}
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex items-center gap-2">
                                            <Checkbox id={perm} checked={field.value} onCheckedChange={field.onChange} />
                                            <Label htmlFor={perm} className="capitalize">{perm.replace(/_/g, ' ')}</Label>
                                        </div>
                                    )}
                                />
                            ))}
                        </div>
                    </fieldset>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AccessEditor({ access, templates, users, onSave, onClose }) {
    const isNew = !access.id;
     const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            client_app_id: access.client_app_id || '',
            user_email: access.user_email || '',
            role_name: access.role_name || '',
            status: access.status || 'active',
        }
    });
    const [isOpen, setIsOpen] = useState(true);

    const handleFormSubmit = async (data) => {
        const payload = { ...access, ...data };
        const success = await onSave(payload, access);
        if (success) {
            setIsOpen(false);
            onClose();
        }
    };
    
    return (
         <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isNew ? 'Assign' : 'Edit'} User Access</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="client_app_id">Client App ID</Label>
                        <Input id="client_app_id" {...register('client_app_id', { required: true })} placeholder="e.g., app_..." />
                        {errors.client_app_id && <p className="text-red-500 text-xs mt-1">Client App ID is required.</p>}
                    </div>
                     <div>
                        <Label>User Email</Label>
                        <Controller
                            name="user_email"
                            control={control}
                            rules={{ required: 'User email is required' }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select a user..." /></SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => <SelectItem key={u.id} value={u.email}>{u.email}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                         {errors.user_email && <p className="text-red-500 text-xs mt-1">{errors.user_email.message}</p>}
                    </div>
                    <div>
                        <Label>Role</Label>
                        <Controller
                            name="role_name"
                            control={control}
                            rules={{ required: 'Role is required' }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Select a role..." /></SelectTrigger>
                                    <SelectContent>
                                        {templates.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                         {errors.role_name && <p className="text-red-500 text-xs mt-1">{errors.role_name.message}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}