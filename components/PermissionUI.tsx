import React from 'react';

const PermissionUI: React.FC = () => {
    const [permissions, setPermissions] = React.useState<{[key: string]: boolean}>({
        read: false,
        write: false,
        execute: false,
    });

    const handlePermissionChange = (permission: string) => {
        setPermissions(prev => ({
            ...prev,
            [permission]: !prev[permission],
        }));
    };

    return (
        <div>
            <h1>AI Agent Permissions and Security Settings</h1>
            <div>
                <label>
                    <input
                        type='checkbox'
                        checked={permissions.read}
                        onChange={() => handlePermissionChange('read')}
                    />
                    Read Access
                </label>
                <label>
                    <input
                        type='checkbox'
                        checked={permissions.write}
                        onChange={() => handlePermissionChange('write')}
                    />
                    Write Access
                </label>
                <label>
                    <input
                        type='checkbox'
                        checked={permissions.execute}
                        onChange={() => handlePermissionChange('execute')}
                    />
                    Execute Access
                </label>
            </div>
            <button onClick={() => console.log(permissions)}>Save Permissions</button>
        </div>
    );
};

export default PermissionUI;