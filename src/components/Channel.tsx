import React from 'react';

import { useForm } from 'react-hook-form';
import { FiEdit3, FiSave } from 'react-icons/fi';

import { Protobuf } from '@meshtastic/meshtasticjs';

import { connection } from '../core/connection.js';
import { EnumSelect } from './generic/form/EnumSelect.jsx';
import { Input } from './generic/form/Input.jsx';
import { IconButton } from './generic/IconButton.jsx';

export interface ChannelProps {
  channel: Protobuf.Channel;
}
interface DotProps {
  role: Protobuf.Channel_Role;
  admin: boolean;
}
const Dot = ({ role, admin }: DotProps): JSX.Element => (
  <div
    className={`h-3 my-auto w-3 rounded-full ${
      role === Protobuf.Channel_Role.PRIMARY
        ? 'bg-green-500'
        : admin
        ? 'bg-amber-400'
        : role === Protobuf.Channel_Role.SECONDARY
        ? 'bg-cyan-500'
        : 'bg-gray-400'
    }`}
  />
);

export const Channel = ({ channel }: ChannelProps): JSX.Element => {
  const [edit, setEdit] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState } = useForm<{
    role: Protobuf.Channel_Role;
    settings: {
      name: string;
    };
  }>({
    defaultValues: {
      role: channel.role,
      settings: {
        name: channel.settings?.name,
      },
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    const adminChannel = Protobuf.Channel.create({
      role: data.role,
      index: channel.index,
      settings: data.settings,
    });

    await connection.setChannel(adminChannel, (): Promise<void> => {
      setLoading(false);
      return Promise.resolve();
    });
  });

  return (
    <div className="relative flex justify-between p-3 bg-gray-100 rounded-md dark:bg-gray-700">
      {edit ? (
        <>
          {loading && (
            <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex rounded-md backdrop-filter backdrop-blur-sm">
              <div className="m-auto text-lg font-medium text-gray-400">
                Loading
              </div>
            </div>
          )}
          <div className="my-auto space-x-2">
            <form>
              <div className="flex space-x-2">
                <EnumSelect
                  label="Channel Type"
                  optionsEnum={Protobuf.Channel_Role}
                  {...register('role', { valueAsNumber: true })}
                />
                <Dot
                  role={channel.role}
                  admin={channel.settings?.name === 'admin'}
                />
              </div>
              <Input label="Name" {...register('settings.name')} />
            </form>
          </div>
          <IconButton
            onClick={async (): Promise<void> => {
              await onSubmit();

              setEdit(false);
            }}
            icon={<FiSave />}
          />
        </>
      ) : (
        <>
          <div className="flex my-auto space-x-2">
            <Dot
              role={channel.role}
              admin={channel.settings?.name === 'admin'}
            />
            <div>
              {channel.settings?.name.length
                ? channel.settings.name
                : channel.role === Protobuf.Channel_Role.PRIMARY
                ? 'Primary'
                : `Channel: ${channel.index}`}
            </div>
          </div>
          <IconButton
            onClick={(): void => {
              setEdit(true);
            }}
            icon={<FiEdit3 />}
          />
        </>
      )}
    </div>
  );
};