import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AddressFields from "./AddressFields";
import RequiredLabel from "../common/RequiredLabel";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import SearchSelect from "../common/SearchSelect";
import { useCountries } from "../../hooks/useCountries";
import { useCountryCodes } from "../../hooks/useCountryCodes";
import {
    registrationSchema,
    type RegistrationFormValues,
} from "./registration.schema";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SelfRegistrationForm() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const inputClass =
        "h-10 text-sm bg-white border-gray-200 focus:border-gray-400 shadow-none transition-all rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none";

    const selectClass =
        "h-10 w-full rounded-lg border border-gray-200 focus:border-gray-400 px-3 text-sm bg-white shadow-none focus:outline-none transition-all";

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            countryCode: "",
            phoneNumber: "",
            specialization: "",
            practitionerType: "",
            addresses: [
                {
                    addressType: "",
                    country: "",
                    state: "",
                    city: "",
                    zip: "",
                    zipCode: "",
                    street: "",
                    house_no: "",
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "addresses",
    });

    const countries = useCountries();
    const rawCountryCodes = useCountryCodes();

    // Map the p_frontend useCountryCodes format to the registration SearchSelect format
    // p_frontend hook: { value: countryName, label: "Name (+Code)", code: "+1", flag, name }
    // Registration SearchSelect needs: { value: "+1", label: "Name +1", flag, countryName }
    const countryCodeOptions = useMemo(() => {
        return rawCountryCodes.map((c) => ({
            value: c.code,
            label: `${c.name} ${c.code}`,
            flag: c.flag,
            countryName: c.name,
        }));
    }, [rawCountryCodes]);

    const onSubmit = async (data: RegistrationFormValues) => {
        setSubmitting(true);
        setError(null);
        try {
            const payload = {
                firstName: data.firstName,
                middleName: data.middleName || null,
                lastName: data.lastName,
                email: data.email,
                phoneNumber: `${data.countryCode}${data.phoneNumber}`,
                specialization: data.specialization || null,
                practitionerType: data.practitionerType || null,
                addresses: data.addresses.map((addr) => ({
                    addressType: addr.addressType,
                    country: addr.country,
                    state: addr.state,
                    city: addr.city,
                    zip: addr.zip,
                    zipCode: addr.zipCode || addr.zip,
                    street: addr.street,
                    house_no: addr.house_no,
                })),
            };

            const response = await fetch(`${API_URL}/registration`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const resData = await response.json();
                throw new Error(resData.message || "Failed to submit registration");
            }

            form.reset();
            navigate("/success");
        } catch (err: unknown) {
            console.error(err);
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* ---------- PERSONAL INFO ---------- */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="h-6 w-1 bg-brand-600 rounded-full block"></span>
                        Personal Information
                    </h3>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium mb-2">
                                        <RequiredLabel>First name</RequiredLabel>
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <Input
                                            {...field}
                                            className={inputClass}
                                            placeholder="John"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="middleName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium mb-2">
                                        <span className="flex items-center gap-1">Middle name</span>
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <Input
                                            {...field}
                                            className={inputClass}
                                            placeholder="Doe"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium mb-2">
                                        <RequiredLabel>Last name</RequiredLabel>
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <Input
                                            {...field}
                                            className={inputClass}
                                            placeholder="Smith"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-6">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="md:col-span-3">
                                    <FormLabel className="text-gray-700 font-medium mb-2">
                                        <RequiredLabel>Email</RequiredLabel>
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <Input
                                            {...field}
                                            className={inputClass}
                                            placeholder="john.smith@example.com"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="countryCode"
                            render={({ field }) => (
                                <FormItem className="md:col-span-1">
                                    <FormLabel className="text-gray-700 font-medium mb-2">
                                        <RequiredLabel>Code</RequiredLabel>
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <SearchSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            options={countryCodeOptions}
                                            placeholder="+1"
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel className="text-gray-700 font-medium mb-2">
                                        <RequiredLabel>Phone number</RequiredLabel>
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <Input
                                            {...field}
                                            className={inputClass}
                                            placeholder="1234567890"
                                            maxLength={20}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-8"></div>

                {/* ---------- PROFESSIONAL INFO ---------- */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="h-6 w-1 bg-brand-600 rounded-full block"></span>
                        Professional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="specialization"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium mb-2">
                                        <span className="flex items-center gap-1">
                                            Specialization
                                        </span>
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <select {...field} className={selectClass}>
                                            <option value="">Select Specialization</option>
                                            <option>General Dentist</option>
                                            <option>Orthodontist</option>
                                            <option>Endodontics</option>
                                            <option>Periodontist</option>
                                            <option>Dental Anesthesiology</option>
                                            <option>Dentistry</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="practitionerType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium mb-2">
                                        <span className="flex items-center gap-1">
                                            Provider Type
                                        </span>
                                    </FormLabel>
                                    <FormControl className="mt-2">
                                        <select {...field} className={selectClass}>
                                            <option value="">Select Type</option>
                                            <option>Practice</option>
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-8"></div>

                {/* ---------- ADDRESSES ---------- */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="h-6 w-1 bg-brand-600 rounded-full block"></span>
                        Addresses
                    </h3>

                    {fields.map((item, index) => (
                        <AddressFields
                            key={item.id}
                            form={form}
                            index={index}
                            countries={countries}
                            remove={remove}
                            canRemove={fields.length > 1}
                        />
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            append({
                                addressType: "",
                                country: "",
                                state: "",
                                city: "",
                                zip: "",
                                zipCode: "",
                                street: "",
                                house_no: "",
                            })
                        }
                        className="mt-4 border-dashed border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 w-full h-12"
                    >
                        + Add another address
                    </Button>
                </div>

                {/* ---------- ACTION ---------- */}
                <div className="flex justify-end pt-8">
                    <Button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Submitting...
                            </div>
                        ) : (
                            "Submit Registration"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
