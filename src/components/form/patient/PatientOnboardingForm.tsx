"use client";

import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "../../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";

import type { Patient } from "../../../types/patientType";
import {
  createPatient,
  type CreatePatientPayload,
} from "../../../api/patients.api";
import { useState } from "react";

/* ---------- HOOKS ---------- */
import { useCountries } from "../../../hooks/useCountries";
import { useStates } from "../../../hooks/useStates";
import { useCities } from "../../../hooks/useCities";
import { useCountryCodes } from "../../../hooks/useCountryCodes";

import axios from "axios";
import type { ApiErrorResponse } from "../../../types/apiError";
import { useLanguage } from "../../../language/useLanguage";
import strings from "../../../language";

type Props = {
  onCreate: (patient: Patient) => void;
};

export default function PatientOnboardingForm({ onCreate }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Patient>({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      contact: "",
      dob: null,
      gender: "",
      address: {
        street: "",
        country: "",
        countryCode: "",
        state: "",
        city: "",
        zipCode: "",
      },
    },
  });

  const { control, handleSubmit, reset } = form;

  /* ---------- WATCH ---------- */
  const country = form.watch("address.country") || "";
  const state = form.watch("address.state") || "";

  /* ---------- DATA ---------- */
  const countries = useCountries();
  const states = useStates(country);
  const cities = useCities(country, state);
  const countryCodes = useCountryCodes();
  const { language } = useLanguage();
  const t = strings[language].patients;
  const formText = t.form;

  const inputClass =
    "h-9 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

  const selectTriggerClass =
    "h-9 shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0";

  async function onSubmit(values: Patient) {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert Date to ISO string (YYYY-MM-DD) for API
      // Structure data with nested address
      const { dob, ...patientDataWithoutId } = values;
      const patientData: CreatePatientPayload = {
        ...patientDataWithoutId,
        dob: dob ? dob.toISOString().split("T")[0] : null,
        address: values.address || {
          street: "",
          city: "",
          state: "",
          country: "",
          countryCode: "",
          zipCode: "",
        },
      };

      // Map country name back to code for connection
      if (patientData.address && patientData.address.countryCode) {
        const selected = countryCodes.find(
          (c) => c.value === patientData.address.countryCode,
        );
        if (selected) {
          patientData.address.countryCode = selected.code;
        }
      }

      console.log("Submitting patient data:", patientData);

      // Call the API to save to database
      const savedPatient = await createPatient(patientData);

      console.log("Patient saved successfully:", savedPatient);

      // Convert dob string back to Date and handle addresses array
      const patientWithDate = {
        ...savedPatient,
        dob: savedPatient.dob ? new Date(savedPatient.dob) : null,
        address:
          savedPatient.addresses && savedPatient.addresses.length > 0
            ? savedPatient.addresses[0]
            : savedPatient.address,
      };

      onCreate(patientWithDate);
      reset();
    } catch (err: unknown) {
      console.error("Error creating patient:", err);

      let errorMessage = "Failed to create patient. Please try again.";

      if (axios.isAxiosError<ApiErrorResponse>(err)) {
        const message = err.response?.data?.message;

        if (Array.isArray(message)) {
          errorMessage = message.join(", ");
        } else if (typeof message === "string") {
          errorMessage = message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ---------- NAME ---------- */}
        <div className="flex items-center gap-2 pt-6">
          <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
          <h3 className="text-sm font-bold">{formText.personalInfo} </h3>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="firstName"
            rules={{ required: formText.validation.firstNameRequired }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {formText.firstName} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={formText.enter}
                    {...field}
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{formText.middleName}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={formText.enter}
                    {...field}
                    className={inputClass}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="lastName"
            rules={{ required: formText.validation.lastNameRequired }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {formText.lastName} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={formText.enter}
                    {...field}
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ---------- CONTACT ---------- */}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="email"
            rules={{
              required: formText.validation.emailRequired,
              pattern: {
                value: /^\S+@\S+$/i,
                message: formText.validation.invalidEmail,
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  {formText.email} <span className="text-red-500">*</span>{" "}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={formText.enterEmail}
                    {...field}
                    className={inputClass}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 w-full">
            <FormField
              control={control}
              name="address.countryCode"
              render={({ field }) => (
                <FormItem className="w-[140px]">
                  <FormLabel className="text-black dark:text-white">
                    {formText.countryCode}
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder={formText.selectCode}>
                          {field.value ? (
                            (() => {
                              const selected = countryCodes.find(
                                (c) => c.value === field.value,
                              );
                              return selected ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={selected.flag}
                                    alt={selected.name}
                                    className="h-4 w-6 object-cover rounded-sm"
                                  />
                                  <span className="text-xs text-muted-foreground mr-1">
                                    {selected.code}
                                  </span>
                                </div>
                              ) : (
                                field.value
                              );
                            })()
                          ) : (
                            <span className="text-muted-foreground">
                              {formText.selectCode}
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent className="max-h-60 overflow-y-auto">
                      {countryCodes.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <img
                              src={option.flag}
                              alt={option.name}
                              className="h-4 w-6 object-cover rounded-sm"
                            />
                            <span className="truncate max-w-[120px]">
                              {option.name}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {option.code}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="contact"
              rules={{
                required: formText.validation.contactRequired,
                pattern: {
                  value: /^[0-9]+$/,
                  message: formText.validation.digitsOnly,
                },
                minLength: {
                  value: 10,
                  message: formText.validation.minDigits,
                },
                maxLength: {
                  value: 15,
                  message: formText.validation.maxDigits,
                },
                validate: (value) => {
                  if (/^0+$/.test(value)) {
                    return formText.validation.invalidContact;
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-black dark:text-white">
                    {formText.contact} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={formText.enterContact}
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="dob"
            rules={{ required: formText.validation.dobRequired }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-black dark:text-white">
                  {formText.dateOfBirth} <span className="text-red-500">*</span>
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-78 justify-start text-left font-normal shadow-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value
                          ? format(field.value, "PPP")
                          : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ?? undefined}
                      onSelect={field.onChange}
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ---------- DOB + GENDER ---------- */}

          <FormField
            control={control}
            name="gender"
            rules={{ required: formText.validation.genderRequired }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black dark:text-white">
                  {formText.gender} <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={selectTriggerClass}>
                      <SelectValue placeholder={formText.selectGender} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    position="popper"
                    className="max-h-60 overflow-y-auto"
                  >
                    <SelectItem value="Male">
                      {formText.genderOptions.male}
                    </SelectItem>
                    <SelectItem value="Female">
                      {formText.genderOptions.female}
                    </SelectItem>
                    <SelectItem value="Other">
                      {formText.genderOptions.other}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ---------- ADDRESS ---------- */}

        <div className="space-y-4">
          <div className="flex items-center gap-2 pt-6">
            <span className="h-6 w-1 bg-brand-500 rounded-full block"></span>
            <h3 className="text-sm font-bold">{formText.addresses} </h3>
          </div>

          {/* STREET + COUNTRY */}
          <div className="grid grid-cols-4 gap-4">
            {/* STREET */}
            <FormField
              control={control}
              name="address.street"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>{formText.street}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={formText.enter}
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* COUNTRY */}
            <FormField
              control={control}
              name="address.country"
              rules={{ required: formText.validation.countryRequired }}
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-black dark:text-white">
                    {formText.country} <span className="text-red-500">*</span>
                  </FormLabel>

                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("address.state", "");
                      form.setValue("address.city", "");
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder={formText.selectCountry}>
                          {field.value
                            ? (() => {
                                const selected = countries.find(
                                  (c) => c.name === field.value,
                                );
                                return selected ? (
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={selected.flag}
                                      alt={selected.name}
                                      className="h-4 w-6 object-cover rounded-sm"
                                    />
                                    <span>{selected.name}</span>
                                  </div>
                                ) : (
                                  field.value
                                );
                              })()
                            : formText.selectCountry}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent
                      side="bottom"
                      sideOffset={4}
                      avoidCollisions={false}
                      className="max-h-60 overflow-y-auto"
                    >
                      {countries.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          <div className="flex items-center gap-2">
                            <img
                              src={c.flag}
                              alt={c.name}
                              className="h-4 w-6 object-cover rounded-sm"
                            />
                            <span>{c.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* STATE + CITY + ZIP */}
          <div className="grid grid-cols-2 gap-4">
            {/* STATE */}
            <FormField
              control={control}
              name="address.state"
              rules={{ required: formText.validation.stateRequired }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black dark:text-white">
                    {formText.state} <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("address.city", "");
                    }}
                    disabled={!country}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder={formText.selectState} />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent
                      position="popper"
                      className="max-h-60 overflow-y-auto"
                    >
                      {states.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CITY */}
            <FormField
              control={control}
              name="address.city"
              rules={{ required: formText.validation.cityRequired }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black dark:text-white">
                    {formText.city} <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!state}
                  >
                    <FormControl>
                      <SelectTrigger className={selectTriggerClass}>
                        <SelectValue placeholder={formText.selectCity} />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent
                      position="popper"
                      className="max-h-60 overflow-y-auto"
                    >
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ZIP */}
            <FormField
              control={control}
              name="address.zipCode"
              rules={{ required: formText.validation.zipCodeRequired }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black dark:text-white">
                    {formText.zipCode} <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={formText.enter}
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* ---------- ERROR MESSAGE ---------- */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {formText.errors.createFailed}
          </div>
        )}

        {/* ---------- ACTIONS ---------- */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="submit"
            className="h-9 rounded-md  px-4 text-sm font-medium text-white hover:bg-brand-button/80 transition-opacity duration-200 bg-brand-button"
            // style={{ backgroundColor: "var(--brand-button)" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? formText.creating : formText.addPatientButton}
          </Button>
        </div>
      </form>
    </Form>
  );
}
