<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDoctorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
{
    return true;
}

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
{
    return [
        // User

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
            'min:8',
            'confirmed',
        ],

        // Doctor

        'specialization_id' => [
            'required',
            'exists:specializations,id',
        ],

        'gender' => [
            'required',
            'in:male,female',
        ],

        'date_of_birth' => [
            'nullable',
            'date',
            'before:today',
        ],

        'experience_years' => [
            'nullable',
            'integer',
            'min:0',
        ],

        'consultation_fee' => [
            'nullable',
            'numeric',
            'min:0',
        ],

        'address' => [
            'nullable',
            'string',
            'max:500',
        ],

        'bio' => [
            'nullable',
            'string',
            'max:1000',
        ],

        'image' => [
            'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:2048',
        ],

        'status' => [
            'nullable',
            'boolean',
        ],
    ];
}
public function messages(): array
{
    return [

        'name.required' => 'Doctor name is required.',

        'email.required' => 'Email is required.',
        'email.unique' => 'This email already exists.',

        'phone.required' => 'Phone is required.',
        'phone.unique' => 'This phone already exists.',

        'password.required' => 'Password is required.',
        'password.confirmed' => 'Password confirmation does not match.',

        'specialization_id.required' => 'Please select a specialization.',

        'gender.required' => 'Please select gender.',

        'image.image' => 'The uploaded file must be an image.',
    ];
}
}
