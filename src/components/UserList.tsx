import React, { useState, useEffect } from 'react';
    import { supabase } from '../lib/supabase';
    import { User } from '../types';
    import { UserPlus, Trash2, Edit } from 'lucide-react';
    import toast from 'react-hot-toast';
    import { useNavigate } from 'react-router-dom';

    export function UserList() {
      const [users, setUsers] = useState<User[]>([]);
      const [isLoading, setIsLoading] = useState(true);
      const navigate = useNavigate();

      useEffect(() => {
        loadUsers();
      }, []);

const loadUsers = async () => {
  setIsLoading(true);
  try {
    // Ensure 'get_profiles_with_email' is the correct function name
    const { data, error } = await supabase.rpc('get_profiles_with_email');
    
    if (error) throw error;
    console.log("Loaded users:", data);  // Check if the data is being returned
    setUsers(data || []);
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setIsLoading(false);
  }
};


      const handleDelete = async (id: string) => {
        try {
          const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

          if (error) throw error;
          setUsers(users.filter(user => user.id !== id));
          toast.success('User deleted successfully');
        } catch (error: any) {
          toast.error(error.message);
        }
      };

      if (isLoading) {
        return (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        );
      }

      return (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Users</h1>
            <button
              onClick={() => navigate('/users/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              New User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badge Number
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.badge_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
