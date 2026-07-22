<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'phone' => [
                'required',
                'string',
                'max:20',
                'unique:users,phone',
            ],

            'password' => [
                'required',
                'confirmed',
                'min:8',
            ],

            'gender' => [
                'required',
                'in:male,female',
            ],

            'date_of_birth' => [
                'required',
                'date',
                'before:today',
            ],

            'blood_group' => [
                'nullable',
                'in:A+,A-,B+,B-,AB+,AB-,O+,O-',
            ],

            'address' => [
                'required',
                'string',
                'max:500',
            ],

            'emergency_contact_name' => [
                'required',
                'string',
                'max:255',
            ],

            'emergency_contact_phone' => [
                'required',
                'string',
                'max:20',
            ],

            'medical_history' => [
                'nullable',
                'string',
            ],

            'status' => [
                'required',
                'boolean',
            ],

        ];
    }

    public function messages(): array
    {
        return [

            'name.required' => 'Patient name is required.',

            'email.required' => 'Email is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email is already registered.',

            'phone.required' => 'Phone number is required.',
            'phone.unique' => 'This phone number is already registered.',

            'password.required' => 'Password is required.',
            'password.confirmed' => 'Password confirmation does not match.',
            'password.min' => 'Password must be at least 8 characters.',

            'gender.required' => 'Please select gender.',

            'date_of_birth.required' => 'Date of birth is required.',
            'date_of_birth.before' => 'Date of birth must be before today.',

            'address.required' => 'Address is required.',

            'emergency_contact_name.required' => 'Emergency contact name is required.',

            'emergency_contact_phone.required' => 'Emergency contact phone is required.',

            'status.required' => 'Please select status.',

        ];
    }
}
