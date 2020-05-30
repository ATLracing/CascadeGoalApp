import * as PackedRecord from 'src/app/providers/packed_record'

// export function remove_id_from_array(remove_element: PackedRecord.ID, array: PackedRecord.ID[])
// {
//     for (let i = array.length - 1; i >= 0; --i)
//     {
//         let current_element = array[i];

//         if (JSON.stringify(current_element) == JSON.stringify(remove_element))
//             array.splice(i, 1);
//     }
// }

// export function record_array_to_id_array(record_array: any[]) : any[]
// {
//     let id_array = [];

//     for (let record of record_array)
//     {
//         id_array.push(record.unique_id);
//     }

//     return id_array;
// }