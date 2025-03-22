import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { StepsModule } from 'primeng/steps';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ChipModule } from 'primeng/chip';
import { Message } from 'primeng/message';

import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.models';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [
    StepsModule,
    ButtonModule,
    PasswordModule,
    FormsModule,
    ReactiveFormsModule,
    ChipModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    RouterModule,
    CommonModule,
    Message,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    first_name: new FormControl('', [Validators.required]),
    last_name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email]),
    invested_apps: new FormControl([]),
  });

  errors: string[] = [];

  showPassword = false;
  showConfirmPassword = false;

  thirdPartyList = [
    {
      name: 'Zerodha',
      selected: false,
      logo: 'kite_logo.png',
    },
    {
      name: 'Angel Broking',
      selected: false,
      logo: 'angel_logo.webp',
    },
    {
      name: 'Motilal Oswal',
      selected: false,
      logo: 'motilal_oswal.png',
    },
  ];

  public active: number = 0;
  items: MenuItem[] | undefined = [
    {
      label: 'Login Credentials',
    },
    {
      label: 'Personal Information',
    },
    {
      label: 'Past Invests',
    },
  ];

  selectedThirdParty: string[] = [];

  constructor(private auth: AuthService) {}

  prev() {
    if (this.active > 0) {
      this.active -= 1;
    }
  }

  next() {
    switch (this.active) {
      case 0:
        if (this.stage1Errors()) {
          return;
        }
        break;

      case 1:
        if (this.stage2Errors()) {
          return;
        }
        break;
      default:
        break;
    }
    if (this.active < this.items!.length) {
      this.active += 1;
    }
  }

  register() {
    if (this.registerForm.valid) {
      const data = { ...this.registerForm.getRawValue() } as RegisterRequest;
      data.invested_apps = this.thirdPartyList
        .map((item) => (item.selected ? item.name : ''))
        .filter((val, idx, arr) => val !== '');
      console.log(data);

      this.auth.register(data);
    }
  }

  confirmPassword = '';
  stage1Errors() {
    this.errors = [];
    const constrols = this.registerForm.controls;
    if (constrols.username.invalid) {
      this.errors.push('Username required!');
    }

    if (constrols.password.invalid) {
      this.errors.push('Password required!');
      return true;
    }
    if (constrols.password.value !== this.confirmPassword) {
      this.errors.push('Passwords must match!');
    }

    return this.errors.length > 0;
  }
  stage2Errors() {
    this.errors = [];
    const constrols = this.registerForm.controls;
    if (constrols.first_name.invalid) {
      this.errors.push('First name is required!');
    }
    if (constrols.last_name.invalid) {
      this.errors.push('Last name is required!');
    }
    if (constrols.email.invalid) {
      this.errors.push('Email is invalid!');
    }
    return this.errors.length > 0;
  }
}
