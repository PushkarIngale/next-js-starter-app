'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
   console.log("🚀 ~ createInvoice ~ formData:", formData)
   // Validate form fields
  try {
     const validatedFields = CreateInvoice.safeParse({
         customerId: formData.get('customerId'),
         amount: formData.get('amount'),
         status: formData.get('status'),
     });
  
     // If form validation fails, return errors early.
     if (!validatedFields.success) {
       return {
         errors: validatedFields.error.flatten().fieldErrors,
         message: 'Missing Fields. Failed to Create Invoice.',
       };
     }
  
     const { customerId, amount, status } = validatedFields.data;
     const amountInCents = amount * 100;
     const date = new Date().toISOString().split('T')[0];
   
     // Insert data into the database
     try {
       await sql`
         INSERT INTO invoices (customer_id, amount, status, date)
         VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
       `;
     } catch (error) {
       // If a database error occurs, return a more specific error.
       return {
         message: 'Database Error: Failed to Create Invoice.',
       };
     }
  } catch (error) {
    console.error('Error creating invoice:', error);
  }
 
   // Revalidate the cache and redirect the user.
   revalidatePath('/dashboard/invoices');
   redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  const amountInCents = amount * 100;
 
  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${Math.round(amountInCents)}, status = ${status}
    WHERE id = ${id}
  `;
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}