export function remove_element_from_array(remove_element: any, array: any[])
{
    for (let i = 0; i < array.length; ++i)
    {
        let current_element = array[i];

        if (current_element == remove_element)
            return array.splice(i, 1);
    }

    return array;
}

export function record_array_to_id_array(record_array: any[]) : any[]
{
    let id_array = [];

    for (let record of record_array)
    {
        id_array.push(record.unique_id);
    }

    return id_array;
}