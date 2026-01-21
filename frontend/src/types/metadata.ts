export interface PicklistOption {
  name: string;
  label: string;
}

export interface MetaObjectRecordType {
  id: string;
  object_id: string;
  name: string;
  label: string;
  description?: string | null;
  source: 'system' | 'custom';
  order: number;
}

export interface MetaField {
  id: string;
  object_id: string;
  name: string;
  label: string;
  description?: string | null;
  data_type: string;
  options?: PicklistOption[] | null;
  is_required: boolean;
  source: 'system' | 'custom';
}

export interface MetaObject {
  id: string;
  name: string;
  label: string;
  description?: string | null;
  source: 'system' | 'custom';
  created_at: string;
  fields: MetaField[];
  has_record_type?: boolean;
  record_types?: MetaObjectRecordType[];
}

export interface MetaRole {
  id: string;
  name: string;
  label: string;
  description?: string | null;
  permissions?: any;
  source: 'system' | 'custom';
}
