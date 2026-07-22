<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $doctor = $this->route('doctor');
        $user = $doctor->user;

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
                Rule::unique('users', 'email')->ignore($user->id),
            ],

            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->ignore($user->id),
            ],

            'password' => [
                'nullable',
                'min:8',
                'confirmed',
            ],

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
}
