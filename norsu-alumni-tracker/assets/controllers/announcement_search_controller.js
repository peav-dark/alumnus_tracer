import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
    static targets = ['input', 'suggestions', 'suggestionList', 'card', 'emptyState'];

    connect() {
        this.hideSuggestions();
        this.filterCards('');
        this.boundClose = this.closeOnOutsideClick.bind(this);
        document.addEventListener('click', this.boundClose);
    }

    disconnect() {
        document.removeEventListener('click', this.boundClose);
    }

    onInput() {
        const query = this.inputTarget.value.trim().toLowerCase();
        this.filterCards(query);
        this.renderSuggestions(query);
    }

    onFocus() {
        const query = this.inputTarget.value.trim().toLowerCase();
        if (query.length > 0) {
            this.renderSuggestions(query);
        }
    }

    pickSuggestion(event) {
        const value = event.currentTarget.dataset.value || '';
        this.inputTarget.value = value;
        this.filterCards(value.toLowerCase());
        this.hideSuggestions();
    }

    closeOnEscape(event) {
        if (event.key === 'Escape') {
            this.hideSuggestions();
        }
    }

    closeOnOutsideClick(event) {
        if (!this.element.contains(event.target)) {
            this.hideSuggestions();
        }
    }

    renderSuggestions(query) {
        if (!this.hasSuggestionListTarget) {
            return;
        }

        this.suggestionListTarget.innerHTML = '';

        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        const matches = this.cardTargets
            .map((card) => card.dataset.title || '')
            .filter((title) => title.includes(query))
            .filter((value, idx, arr) => arr.indexOf(value) === idx)
            .slice(0, 6);

        if (matches.length === 0) {
            this.hideSuggestions();
            return;
        }

        matches.forEach((match) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors';
            button.textContent = this.toDisplayText(match);
            button.dataset.value = this.toDisplayText(match);
            button.addEventListener('click', (event) => this.pickSuggestion(event));
            this.suggestionListTarget.appendChild(button);
        });

        this.suggestionsTarget.classList.remove('hidden');
    }

    filterCards(query) {
        let visibleCount = 0;

        this.cardTargets.forEach((card) => {
            const haystack = (card.dataset.searchText || '').toLowerCase();
            const isVisible = query === '' || haystack.includes(query);
            card.classList.toggle('hidden', !isVisible);
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (this.hasEmptyStateTarget) {
            this.emptyStateTarget.classList.toggle('hidden', visibleCount > 0);
        }
    }

    hideSuggestions() {
        if (this.hasSuggestionsTarget) {
            this.suggestionsTarget.classList.add('hidden');
        }
    }

    toDisplayText(value) {
        return value
            .split(' ')
            .filter((word) => word.length > 0)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
