import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['button', 'menu', 'icon'];

    connect() {
        this.usesTransitionMenu = this.menuTarget.classList.contains('transition-all');

        if (this.usesTransitionMenu) {
            const isOpen = !this.menuTarget.classList.contains('max-h-0') && !this.menuTarget.classList.contains('opacity-0');
            this.buttonTarget.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (this.hasIconTarget) {
                this.iconTarget.style.transform = isOpen ? 'rotate(180deg)' : '';
            }
        } else {
            const isOpen = !this.menuTarget.classList.contains('hidden');
            this.buttonTarget.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (this.hasIconTarget) {
                this.iconTarget.style.transform = isOpen ? 'rotate(180deg)' : '';
            }
        }

        this.boundOutsideClick = this.handleOutsideClick.bind(this);
        document.addEventListener('click', this.boundOutsideClick);
    }

    disconnect() {
        document.removeEventListener('click', this.boundOutsideClick);
    }

    toggle(event) {
        event.stopPropagation();

        const isOpen = this.buttonTarget.getAttribute('aria-expanded') === 'true';
        this.setMenuState(!isOpen);
    }

    handleOutsideClick(event) {
        if (this.element.contains(event.target)) {
            return;
        }

        if (this.buttonTarget.getAttribute('aria-expanded') === 'true') {
            this.setMenuState(false);
        }
    }

    setMenuState(open) {
        this.buttonTarget.setAttribute('aria-expanded', open ? 'true' : 'false');

        if (this.usesTransitionMenu) {
            if (open) {
                this.menuTarget.classList.add('mt-1', 'max-h-40', 'opacity-100');
                this.menuTarget.classList.remove('max-h-0', 'opacity-0', 'pointer-events-none');
            } else {
                this.menuTarget.classList.remove('mt-1', 'max-h-40', 'opacity-100');
                this.menuTarget.classList.add('max-h-0', 'opacity-0', 'pointer-events-none');
            }
        } else {
            this.menuTarget.classList.toggle('hidden', !open);
        }

        if (this.hasIconTarget) {
            this.iconTarget.style.transform = open ? 'rotate(180deg)' : '';
        }
    }
}
